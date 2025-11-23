# Terraform Infrastructure Setup

This directory contains Terraform configuration for setting up AWS infrastructure for image optimization.

## Prerequisites

1. **Terraform** installed (>= 1.0)
   ```bash
   # Check installation
   terraform version
   ```

2. **AWS CLI** configured with credentials
   ```bash
   # Configure AWS credentials
   aws configure
   
   # Verify credentials
   aws sts get-caller-identity
   ```

3. **AWS Account** with appropriate permissions:
   - S3: Create bucket, manage policies
   - CloudFront: Create distribution, manage OAC
   - IAM: Create service roles (if needed)

## Quick Start

1. **Copy example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit terraform.tfvars:**
   ```hcl
   aws_region      = "us-east-1"
   environment     = "prod"
   s3_bucket_name  = "selfcar-images-prod"
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Review plan:**
   ```bash
   terraform plan
   ```

5. **Apply configuration:**
   ```bash
   terraform apply
   ```

6. **Get outputs:**
   ```bash
   terraform output
   ```

## Configuration

### Variables

- `aws_region`: AWS region for resources (default: us-east-1)
- `environment`: Environment name (default: prod)
- `s3_bucket_name`: S3 bucket name (default: selfcar-images-prod)
- `enable_versioning`: Enable S3 versioning (default: false)
- `cloudfront_price_class`: CloudFront price class (default: PriceClass_200)

### Outputs

After applying, you'll get:
- `s3_bucket_name`: S3 bucket name
- `cloudfront_domain_name`: CloudFront distribution domain
- `cdn_url`: Full CDN URL
- `oac_id`: Origin Access Control ID

## Usage

### Apply Configuration
```bash
terraform apply
```

### Destroy Infrastructure
```bash
terraform destroy
```

### Update Configuration
```bash
# Edit terraform.tfvars or variables
terraform plan
terraform apply
```

## State Management

### Local State (Default)
State is stored locally in `terraform.tfstate`.

### Remote State (Recommended for Production)
Uncomment and configure the backend in `main.tf`:

```hcl
backend "s3" {
  bucket = "selfcar-terraform-state"
  key    = "image-optimization/terraform.tfstate"
  region = "us-east-1"
}
```

## Resources Created

- **S3 Bucket**: Private bucket for images
- **S3 Bucket Policy**: Allows CloudFront access only
- **CloudFront OAC**: Origin Access Control
- **CloudFront Distribution**: CDN for image delivery
- **Encryption**: Server-side encryption enabled
- **Public Access Block**: All public access blocked

## Cost Estimation

Approximate monthly costs (varies by usage):
- **S3 Storage**: ~$0.023 per GB
- **S3 Requests**: ~$0.005 per 1,000 requests
- **CloudFront Data Transfer**: ~$0.085 per GB (first 10 TB)
- **CloudFront Requests**: ~$0.0075 per 10,000 requests

Use AWS Cost Calculator for accurate estimates:
https://calculator.aws/

## Troubleshooting

### Bucket Already Exists
If bucket name is taken, change `s3_bucket_name` in `terraform.tfvars`.

### CloudFront Distribution Slow
Distribution creation can take 15-30 minutes. Be patient.

### Permission Errors
Ensure AWS credentials have:
- `s3:CreateBucket`
- `s3:PutBucketPolicy`
- `cloudfront:CreateDistribution`
- `cloudfront:CreateOriginAccessControl`

## Next Steps

After infrastructure is created:

1. **Get outputs:**
   ```bash
   terraform output cloudfront_domain_name
   ```

2. **Configure environment variables:**
   ```bash
   # Backend
   AWS_CDN_DOMAIN=$(terraform output -raw cloudfront_domain_name)
   AWS_S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
   
   # Frontend
   VITE_CDN_BASE_URL=https://$(terraform output -raw cloudfront_domain_name)
   ```

3. **Test image upload:**
   ```bash
   # See scripts/test-image-upload.ps1
   ```

## Support

For issues:
- Check Terraform documentation: https://www.terraform.io/docs
- Review AWS CloudFront documentation
- Check infrastructure logs

