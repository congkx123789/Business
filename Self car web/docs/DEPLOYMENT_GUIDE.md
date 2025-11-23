# Complete Deployment Guide: Image Optimization

This guide walks you through deploying the complete image optimization solution step by step.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up AWS Infrastructure](#step-1-set-up-aws-infrastructure)
3. [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
4. [Step 3: Test Image Uploads Locally](#step-3-test-image-uploads-locally)
5. [Step 4: Deploy to Staging](#step-4-deploy-to-staging)
6. [Step 5: Monitor Metrics and Verify Improvements](#step-5-monitor-metrics-and-verify-improvements)

---

## Prerequisites

Before starting, ensure you have:

- ✅ AWS Account with appropriate permissions
- ✅ AWS CLI installed and configured
- ✅ Terraform installed (for IaC approach) OR access to AWS Console
- ✅ Backend and Frontend code updated
- ✅ Local development environment set up

### Verify Prerequisites

```powershell
# Check AWS CLI
aws --version

# Check AWS credentials
aws sts get-caller-identity

# Check Terraform (if using)
terraform version
```

---

## Step 1: Set Up AWS Infrastructure

Choose one of the following methods:

### Option A: Using Terraform (Recommended)

**1. Navigate to Terraform directory:**
```powershell
cd infrastructure/terraform
```

**2. Copy example variables:**
```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
```

**3. Edit terraform.tfvars:**
```hcl
aws_region      = "us-east-1"
environment     = "staging"  # or "prod"
s3_bucket_name  = "selfcar-images-staging"  # Must be globally unique
```

**4. Initialize and apply:**
```powershell
terraform init
terraform plan
terraform apply
```

**5. Save outputs:**
```powershell
# Save to environment variables
$env:AWS_CDN_DOMAIN = terraform output -raw cloudfront_domain_name
$env:AWS_S3_BUCKET_NAME = terraform output -raw s3_bucket_name
$env:CLOUDFRONT_DISTRIBUTION_ID = terraform output -raw cloudfront_distribution_id
```

**6. Wait for CloudFront deployment:**
CloudFront distributions take 15-30 minutes to deploy. Check status:
```powershell
aws cloudfront get-distribution --id $env:CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.Status' --output text
```

### Option B: Using AWS CLI Scripts

**1. Run setup script:**
```powershell
cd infrastructure/scripts
.\setup-aws-infrastructure.ps1 -BucketName "selfcar-images-staging" -Region "us-east-1"
```

**2. Complete CloudFront setup manually:**
The script will guide you to complete CloudFront setup via AWS Console or CloudFormation.

### Option C: Manual Setup via AWS Console

Follow the detailed guide in `docs/IMAGE_OPTIMIZATION_SETUP.md`.

---

## Step 2: Configure Environment Variables

### Backend Configuration

**1. Get CloudFront domain:**
```powershell
# If using Terraform
$env:AWS_CDN_DOMAIN = terraform output -raw cloudfront_domain_name

# Or set manually
$env:AWS_CDN_DOMAIN = "d1234567890.cloudfront.net"
```

**2. Set AWS credentials:**
```powershell
$env:AWS_ACCESS_KEY_ID = "your-access-key"
$env:AWS_SECRET_ACCESS_KEY = "your-secret-key"
$env:AWS_S3_BUCKET_NAME = "selfcar-images-staging"
$env:AWS_REGION = "us-east-1"
```

**3. Update application properties:**
```powershell
# Use configuration script
.\scripts\configure-env.ps1 -Environment "staging" -Interactive
```

**Or manually edit `backend/src/main/resources/application-staging.properties`:**
```properties
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
aws.s3.bucket-name=${AWS_S3_BUCKET_NAME}
aws.s3.region=${AWS_REGION}
aws.s3.cdn-domain=${AWS_CDN_DOMAIN}
image.cdn.enabled=true
image.cdn.base-url=https://${AWS_CDN_DOMAIN}
```

### Frontend Configuration

**1. Create/update `.env.staging`:**
```powershell
# Use configuration script (automatically updates frontend)
.\scripts\configure-env.ps1 -Environment "staging" -Interactive
```

**Or manually create `frontend/.env.staging`:**
```env
VITE_CDN_ENABLED=true
VITE_CDN_BASE_URL=https://d1234567890.cloudfront.net
```

**2. Build frontend:**
```powershell
cd frontend
npm install
npm run build
```

---

## Step 3: Test Image Uploads Locally

### 3.1 Start Backend

```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=staging
```

Wait for backend to start (check logs for "Started SelfCarBackendApplication").

### 3.2 Get Authentication Token

```powershell
# Login to get JWT token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        email = "admin@selfcar.com"
        password = "your-password"
    } | ConvertTo-Json)

$token = $loginResponse.token
```

### 3.3 Test Image Upload

**Using test script:**
```powershell
.\scripts\test-image-upload.ps1 `
    -ApiBaseUrl "http://localhost:8080/api" `
    -Token $token `
    -CarId 1 `
    -ImagePath "assets/images/test-image.jpg"
```

**Or manually:**
```powershell
$imageBytes = [System.IO.File]::ReadAllBytes("assets/images/test-image.jpg")
$boundary = [System.Guid]::NewGuid().ToString()

$body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="test.jpg"
Content-Type: image/jpeg

$([System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes))
--$boundary
Content-Disposition: form-data; name="carId"

1
--$boundary--
"@

Invoke-RestMethod -Uri "http://localhost:8080/api/car-images/upload" `
    -Method Post `
    -Headers @{Authorization = "Bearer $token"} `
    -ContentType "multipart/form-data; boundary=$boundary" `
    -Body $body
```

### 3.4 Verify Upload

**Check S3 bucket:**
```powershell
aws s3 ls s3://selfcar-images-staging/cars/1/
```

**Check database:**
Image URL should be a CloudFront URL: `https://d1234567890.cloudfront.net/cars/1/...`

**Test CDN access:**
```powershell
# Get image URL from API response, then:
curl -I "https://d1234567890.cloudfront.net/cars/1/image.jpg?width=800&format=webp"
```

### 3.5 Test Frontend

**Start frontend:**
```powershell
cd frontend
npm run dev
```

**Verify:**
1. Open browser to `http://localhost:5173`
2. Navigate to a car detail page
3. Open DevTools → Network tab
4. Check image requests:
   - Should load from CloudFront domain
   - Should include query parameters (`?width=...&format=webp`)
   - Should have appropriate cache headers

---

## Step 4: Deploy to Staging

### 4.1 Deploy Backend

**Build JAR:**
```powershell
cd backend
mvn clean package -DskipTests
```

**Deploy to staging server:**
```powershell
# Copy JAR to server
scp target/selfcar-backend-1.0.0.jar user@staging-server:/app/

# SSH to server and start
ssh user@staging-server
cd /app
java -jar -Dspring.profiles.active=staging selfcar-backend-1.0.0.jar
```

**Or use Docker:**
```powershell
docker build -t selfcar-backend:staging ./backend
docker run -d -p 8080:8080 `
    -e SPRING_PROFILES_ACTIVE=staging `
    -e AWS_ACCESS_KEY_ID=$env:AWS_ACCESS_KEY_ID `
    -e AWS_SECRET_ACCESS_KEY=$env:AWS_SECRET_ACCESS_KEY `
    -e AWS_S3_BUCKET_NAME=$env:AWS_S3_BUCKET_NAME `
    -e AWS_CDN_DOMAIN=$env:AWS_CDN_DOMAIN `
    selfcar-backend:staging
```

### 4.2 Deploy Frontend

**Build for staging:**
```powershell
cd frontend
npm run build -- --mode staging
```

**Deploy to staging server:**
```powershell
# Copy dist folder
scp -r dist/* user@staging-server:/var/www/html/
```

**Or use Docker:**
```powershell
docker build -t selfcar-frontend:staging ./frontend
docker run -d -p 80:80 `
    -e VITE_CDN_ENABLED=true `
    -e VITE_CDN_BASE_URL=https://$env:AWS_CDN_DOMAIN `
    selfcar-frontend:staging
```

### 4.3 Verify Deployment

**Health checks:**
```powershell
# Backend health
curl https://api-staging.selfcar.com/actuator/health

# Frontend accessible
curl https://staging.selfcar.com
```

**Test image upload:**
```powershell
.\scripts\test-image-upload.ps1 `
    -ApiBaseUrl "https://api-staging.selfcar.com/api" `
    -Token $token `
    -CarId 1
```

**Test CDN delivery:**
1. Upload an image via API
2. Visit car detail page
3. Verify images load from CloudFront
4. Check browser DevTools → Network for CDN URLs

---

## Step 5: Monitor Metrics and Verify Improvements

### 5.1 Start Metrics Monitoring

**Using monitoring script:**
```powershell
# One-time check
.\scripts\monitor-metrics.ps1 -ApiBaseUrl "https://api-staging.selfcar.com"

# Continuous monitoring
.\scripts\monitor-metrics.ps1 `
    -ApiBaseUrl "https://api-staging.selfcar.com" `
    -Continuous `
    -IntervalSeconds 30
```

**Or query directly:**
```powershell
Invoke-RestMethod -Uri "https://api-staging.selfcar.com/api/metrics/performance/baseline"
```

### 5.2 Monitor CloudFront Metrics

**AWS Console:**
1. Go to CloudFront Console
2. Select your distribution
3. View metrics:
   - **Requests**: Total requests
   - **Data Transfer**: Bandwidth usage
   - **Cache Hit Rate**: Should be > 85%

**AWS CLI:**
```powershell
aws cloudwatch get-metric-statistics `
    --namespace AWS/CloudFront `
    --metric-name Requests `
    --dimensions Name=DistributionId,Value=$env:CLOUDFRONT_DISTRIBUTION_ID `
    --start-time (Get-Date).AddHours(-24).ToString("yyyy-MM-ddTHH:mm:ss") `
    --end-time (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss") `
    --period 3600 `
    --statistics Sum
```

### 5.3 Verify Improvements

**Baseline Metrics (Before):**
- Record initial metrics:
  ```powershell
  $baseline = Invoke-RestMethod -Uri "https://api-staging.selfcar.com/api/metrics/performance/baseline"
  $baseline | ConvertTo-Json -Depth 10 | Out-File baseline-metrics.json
  ```

**After Deployment:**
- Compare metrics after 24-48 hours:
  ```powershell
  $current = Invoke-RestMethod -Uri "https://api-staging.selfcar.com/api/metrics/performance/baseline"
  # Compare $baseline and $current
  ```

**Success Criteria:**
- ✅ **Image Size Reduction**: 30-50% smaller files
- ✅ **CDN Cache Hit Rate**: > 85%
- ✅ **LCP Improvement**: 20-30% faster
- ✅ **Bandwidth Reduction**: 40-60% less

### 5.4 Set Up Alerts

**CloudWatch Alarms:**
```powershell
# High error rate alarm
aws cloudwatch put-metric-alarm `
    --alarm-name "CloudFront-HighErrorRate" `
    --alarm-description "Alert when CloudFront error rate > 5%" `
    --metric-name ErrorRate `
    --namespace AWS/CloudFront `
    --statistic Average `
    --period 300 `
    --threshold 5 `
    --comparison-operator GreaterThanThreshold
```

**Application Alerts:**
Monitor via your existing monitoring system (Prometheus, Grafana, etc.)

---

## Troubleshooting

### Images Not Loading from CDN

**Check:**
1. CloudFront distribution status (must be "Deployed")
2. S3 bucket policy allows CloudFront access
3. OAC configuration is correct
4. Image URLs are correct format

**Debug:**
```powershell
# Check CloudFront distribution
aws cloudfront get-distribution --id $env:CLOUDFRONT_DISTRIBUTION_ID

# Test direct S3 access (should fail)
aws s3 cp s3://$env:AWS_S3_BUCKET_NAME/cars/1/test.jpg - --no-sign-request
# Should return "Access Denied" - this is correct!
```

### Metrics Not Collecting

**Check:**
1. Frontend is sending metrics to backend
2. Backend endpoint is accessible: `/api/metrics/performance`
3. CORS is configured correctly
4. Browser console for errors

**Debug:**
```powershell
# Check metrics endpoint
Invoke-RestMethod -Uri "https://api-staging.selfcar.com/api/metrics/performance/baseline"

# Check backend logs
# Look for "Error recording metrics" or similar
```

### Upload Failures

**Check:**
1. AWS credentials are correct
2. S3 bucket exists and is accessible
3. IAM permissions are sufficient
4. File size limits (check `application.properties`)

**Debug:**
```powershell
# Test S3 access
aws s3 ls s3://$env:AWS_S3_BUCKET_NAME/

# Check backend logs for upload errors
```

---

## Production Deployment

Once staging is verified:

1. **Repeat Step 1** with production bucket/distribution
2. **Update environment variables** for production
3. **Deploy to production** following Step 4
4. **Monitor closely** for first 24-48 hours
5. **Gradual rollout** (canary deployment recommended)

---

## Next Steps

- Set up automated monitoring dashboards
- Configure CloudWatch alarms
- Set up automated backups
- Review and optimize costs
- Plan for scaling

---

## Support

For issues:
- Check `docs/IMAGE_OPTIMIZATION_SETUP.md`
- Review `docs/DEPLOYMENT_CHECKLIST.md`
- Check AWS CloudFront and S3 logs
- Review application logs

