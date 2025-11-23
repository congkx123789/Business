# Image Optimization Deployment Checklist

Use this checklist to ensure all components are properly configured and deployed.

## Pre-Deployment

### AWS Infrastructure Setup

- [ ] **S3 Bucket Created**
  - [ ] Bucket name: `selfcar-images-prod` (or your preferred name)
  - [ ] Region: `us-east-1` (or your preferred region)
  - [ ] Public access blocked (all access through CloudFront)
  - [ ] Versioning enabled (optional, for recovery)
  - [ ] Lifecycle policy configured (optional, for cost optimization)

- [ ] **Origin Access Control (OAC) Created**
  - [ ] OAC created in CloudFront console
  - [ ] Signing behavior: `always`
  - [ ] Signing protocol: `sigv4`
  - [ ] OAC ID recorded

- [ ] **S3 Bucket Policy Updated**
  - [ ] Policy allows CloudFront service principal
  - [ ] Policy denies direct access (except from CloudFront)
  - [ ] Policy references correct CloudFront distribution ARN
  - [ ] Policy applied to bucket

- [ ] **CloudFront Distribution Created**
  - [ ] Origin domain points to S3 bucket
  - [ ] Origin access: OAC enabled
  - [ ] Viewer protocol policy: Redirect HTTP to HTTPS
  - [ ] Allowed HTTP methods: GET, HEAD, OPTIONS
  - [ ] Cache policy: Custom (1 year TTL for images)
  - [ ] Origin request policy: Custom (forward query strings)
  - [ ] Distribution deployed and status: Deployed
  - [ ] CloudFront domain name recorded

- [ ] **Lambda@Edge Function (Optional)**
  - [ ] Function created in `us-east-1` region
  - [ ] Function associated with CloudFront distribution
  - [ ] Function triggers on Viewer Request
  - [ ] Function tested and working

### Backend Configuration

- [ ] **AWS Credentials Configured**
  - [ ] `AWS_ACCESS_KEY_ID` set in environment/properties
  - [ ] `AWS_SECRET_ACCESS_KEY` set in environment/properties
  - [ ] Credentials have S3 read/write permissions
  - [ ] Credentials have CloudFront read permissions (if needed)

- [ ] **Application Properties Updated**
  - [ ] `aws.s3.bucket-name` configured
  - [ ] `aws.s3.region` configured
  - [ ] `aws.s3.cdn-domain` configured (CloudFront domain)
  - [ ] `image.cdn.enabled=true` (production)
  - [ ] `image.cdn.base-url` configured

- [ ] **Dependencies Built**
  - [ ] `mvn clean install` completed successfully
  - [ ] AWS SDK dependencies resolved
  - [ ] No compilation errors

- [ ] **Testing**
  - [ ] Image upload endpoint tested (`/api/car-images/upload`)
  - [ ] Presigned URL generation tested (`/api/car-images/presigned-url`)
  - [ ] Image deletion tested (removes from S3)
  - [ ] CDN URL generation tested

### Frontend Configuration

- [ ] **Environment Variables Set**
  - [ ] `VITE_CDN_ENABLED=true` (production)
  - [ ] `VITE_CDN_BASE_URL` set to CloudFront domain
  - [ ] Variables added to `.env.production`

- [ ] **Build and Test**
  - [ ] `npm run build` completed successfully
  - [ ] No build errors or warnings
  - [ ] Image CDN utilities working
  - [ ] Responsive images rendering correctly

- [ ] **Testing**
  - [ ] VDP page loads optimized images
  - [ ] Car cards show optimized images
  - [ ] Images load from CloudFront domain
  - [ ] Responsive images work on mobile/tablet/desktop
  - [ ] Format optimization working (WebP/AVIF)

## Deployment

### Backend Deployment

- [ ] **Build Artifact**
  - [ ] JAR file built successfully
  - [ ] Application properties included/externalized
  - [ ] AWS credentials configured (via environment variables or IAM role)

- [ ] **Deploy to Staging**
  - [ ] Staging environment configured
  - [ ] Staging S3 bucket configured (if separate)
  - [ ] Staging CloudFront distribution configured
  - [ ] Application deployed and running
  - [ ] Health checks passing

- [ ] **Deploy to Production**
  - [ ] Production environment configured
  - [ ] Production S3 bucket configured
  - [ ] Production CloudFront distribution configured
  - [ ] Application deployed and running
  - [ ] Health checks passing
  - [ ] Monitoring alerts configured

### Frontend Deployment

- [ ] **Build for Production**
  - [ ] Production build created
  - [ ] Environment variables set correctly
  - [ ] CDN URLs configured

- [ ] **Deploy to Staging**
  - [ ] Staging deployment successful
  - [ ] Images loading from CDN
  - [ ] No console errors

- [ ] **Deploy to Production**
  - [ ] Production deployment successful
  - [ ] Images loading from CDN
  - [ ] No console errors
  - [ ] Performance improvements verified

## Post-Deployment

### Verification

- [ ] **Image Upload**
  - [ ] Upload new image via API
  - [ ] Image appears in S3 bucket
  - [ ] Image URL is CDN URL
  - [ ] Image accessible via CloudFront

- [ ] **Image Display**
  - [ ] Images load on VDP pages
  - [ ] Images load on car listing pages
  - [ ] Images use optimized formats
  - [ ] Responsive images work correctly

- [ ] **Performance Metrics**
  - [ ] Metrics collection working
  - [ ] Baseline metrics recorded
  - [ ] LCP improved on VDP pages
  - [ ] Image sizes reduced

- [ ] **CDN Performance**
  - [ ] Cache hit rate > 85%
  - [ ] Images served from edge locations
  - [ ] TTFB improved
  - [ ] Bandwidth reduced

### Monitoring

- [ ] **CloudWatch Metrics**
  - [ ] CloudFront distribution metrics monitored
  - [ ] S3 bucket metrics monitored
  - [ ] Lambda@Edge metrics monitored (if applicable)
  - [ ] Alerts configured for errors

- [ ] **Application Metrics**
  - [ ] Performance metrics endpoint accessible
  - [ ] Metrics logged to monitoring system
  - [ ] Dashboards created for key metrics
  - [ ] Alerts configured for threshold violations

- [ ] **Logs**
  - [ ] CloudFront access logs enabled (optional)
  - [ ] S3 access logs enabled (optional)
  - [ ] Application logs include image operations
  - [ ] Error logs monitored

## Rollback Plan

If issues occur:

- [ ] **Disable CDN**
  - [ ] Set `VITE_CDN_ENABLED=false` in frontend
  - [ ] Set `image.cdn.enabled=false` in backend
  - [ ] Redeploy frontend and backend

- [ ] **Revert Code**
  - [ ] Revert to previous version
  - [ ] Remove S3 upload endpoints
  - [ ] Restore original image URL handling

- [ ] **Monitor**
  - [ ] Check error logs
  - [ ] Monitor user reports
  - [ ] Verify rollback successful

## Success Criteria

After deployment, verify:

- [ ] **30-50% smaller image files** on VDP pages
- [ ] **+15-25% CDN cache hit rate** on VDP assets
- [ ] **20-30% LCP improvement** on VDP pages
- [ ] **40-60% bandwidth reduction**
- [ ] **No increase in errors** or user complaints
- [ ] **All images accessible** and loading correctly

## Support

For issues or questions:
- Check [IMAGE_OPTIMIZATION_SETUP.md](./IMAGE_OPTIMIZATION_SETUP.md)
- Check [IMAGE_OPTIMIZATION_QUICK_START.md](./IMAGE_OPTIMIZATION_QUICK_START.md)
- Review CloudFront and S3 logs
- Check application logs for errors

