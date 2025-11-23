#!/bin/bash

# Setup AWS Infrastructure for Image Optimization
# This script sets up S3 bucket, CloudFront distribution, and OAC using AWS CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${AWS_S3_BUCKET_NAME:-selfcar-images-prod}"
REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-prod}"

echo -e "${GREEN}Setting up AWS Infrastructure for Image Optimization${NC}"
echo "Bucket Name: $BUCKET_NAME"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Creating S3 Bucket${NC}"
# Create S3 bucket
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "Bucket $BUCKET_NAME already exists"
else
    if [ "$REGION" == "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"
    fi
    echo "Bucket $BUCKET_NAME created"
fi

echo -e "${YELLOW}Step 2: Blocking Public Access${NC}"
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
echo "Public access blocked"

echo -e "${YELLOW}Step 3: Enabling Encryption${NC}"
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'
echo "Encryption enabled"

echo -e "${YELLOW}Step 4: Creating Origin Access Control${NC}"
# Create OAC
OAC_OUTPUT=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config \
    Name="${BUCKET_NAME}-oac",OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4 \
    2>/dev/null || echo "OAC may already exist")

OAC_ID=$(echo "$OAC_OUTPUT" | grep -oP '"Id":\s*"\K[^"]+' | head -1)

if [ -z "$OAC_ID" ]; then
    # Try to get existing OAC
    OAC_ID=$(aws cloudfront list-origin-access-controls \
        --query "OriginAccessControlList.Items[?Name=='${BUCKET_NAME}-oac'].Id" \
        --output text | head -1)
fi

if [ -z "$OAC_ID" ]; then
    echo -e "${RED}Error: Could not create or find OAC${NC}"
    exit 1
fi

echo "OAC ID: $OAC_ID"

echo -e "${YELLOW}Step 5: Creating CloudFront Distribution${NC}"
echo -e "${YELLOW}Note: This step requires manual completion in AWS Console or CloudFormation${NC}"
echo "CloudFront distributions are complex to create via CLI."
echo "Please use one of the following:"
echo "  1. Use Terraform (see infrastructure/terraform/)"
echo "  2. Use AWS Console: https://console.aws.amazon.com/cloudfront"
echo "  3. Use CloudFormation template (see infrastructure/cloudformation/)"
echo ""
echo "Required configuration:"
echo "  - Origin Domain: $BUCKET_NAME.s3.$REGION.amazonaws.com"
echo "  - Origin Access: Origin Access Control"
echo "  - OAC ID: $OAC_ID"
echo "  - Viewer Protocol: Redirect HTTP to HTTPS"
echo "  - Allowed Methods: GET, HEAD, OPTIONS"
echo "  - Cache Policy: Custom (1 year TTL)"
echo ""

echo -e "${YELLOW}Step 6: Updating S3 Bucket Policy${NC}"
echo "After creating the CloudFront distribution, update the bucket policy."
echo "See infrastructure/s3-bucket-policy.json for the policy template."
echo "Replace DISTRIBUTION_ID and ACCOUNT_ID with your values."
echo ""

echo -e "${GREEN}Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create CloudFront distribution (see above)"
echo "2. Get CloudFront distribution ID and ARN"
echo "3. Update S3 bucket policy with distribution ARN"
echo "4. Configure environment variables with CloudFront domain"
echo ""

