# Setup AWS Infrastructure for Image Optimization & Observability (PowerShell)
# This script sets up S3/CloudFront and observability plumbing (CloudWatch log groups, OTEL params)

param(
    [string]$BucketName = "selfcar-images-prod",
    [string]$Region = "us-east-1",
    [string]$Environment = "prod",
    [string[]]$LogGroups = @("/selfcar/backend", "/selfcar/inventory-pipeline", "/selfcar/search-api"),
    [string]$OtelEndpoint = "http://otel-collector:4317",
    [string]$EcsCluster = "",
    [string]$EcsService = "",
    [string]$EcsContainerName = "",
    [string]$OtelServiceName = "selfcar-backend"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting up AWS Infrastructure for Image Optimization & Observability" -ForegroundColor Green
Write-Host "Bucket Name: $BucketName"
Write-Host "Region: $Region"
Write-Host "Environment: $Environment"
Write-Host "OTel Endpoint: $OtelEndpoint"
if ($EcsCluster -and $EcsService -and $EcsContainerName) {
    Write-Host "ECS Target: $EcsCluster / $EcsService (container: $EcsContainerName)" -ForegroundColor Cyan
}
Write-Host ""

# Check if AWS CLI is installed
try {
    $null = aws --version
} catch {
    Write-Host "Error: AWS CLI is not installed" -ForegroundColor Red
    exit 1
}

# Check AWS credentials
try {
    $null = aws sts get-caller-identity 2>&1
} catch {
    Write-Host "Error: AWS credentials not configured" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Creating S3 Bucket" -ForegroundColor Yellow
# Create S3 bucket
try {
    aws s3api head-bucket --bucket $BucketName --region $Region 2>&1 | Out-Null
    Write-Host "Bucket $BucketName already exists" -ForegroundColor Green
} catch {
    if ($Region -eq "us-east-1") {
        aws s3api create-bucket --bucket $BucketName --region $Region
    } else {
        aws s3api create-bucket --bucket $BucketName --region $Region --create-bucket-configuration LocationConstraint=$Region
    }
    Write-Host "Bucket $BucketName created" -ForegroundColor Green
}

Write-Host "Step 2: Blocking Public Access" -ForegroundColor Yellow
aws s3api put-public-access-block `
    --bucket $BucketName `
    --region $Region `
    --public-access-block-configuration `
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
Write-Host "Public access blocked" -ForegroundColor Green

Write-Host "Step 3: Enabling Encryption" -ForegroundColor Yellow
$encryptionConfig = @{
    Rules = @(
        @{
            ApplyServerSideEncryptionByDefault = @{
                SSEAlgorithm = "AES256"
            }
        }
    )
} | ConvertTo-Json -Compress

aws s3api put-bucket-encryption `
    --bucket $BucketName `
    --region $Region `
    --server-side-encryption-configuration $encryptionConfig
Write-Host "Encryption enabled" -ForegroundColor Green

Write-Host "Step 4: Creating/Ensuring CloudWatch Log Groups" -ForegroundColor Yellow
foreach ($lg in $LogGroups) {
    try {
        aws logs create-log-group --log-group-name $lg --region $Region 2>$null
        Write-Host "Created log group $lg" -ForegroundColor Green
    } catch {
        Write-Host "Log group $lg may already exist (continuing)" -ForegroundColor DarkYellow
    }
    try {
        aws logs put-retention-policy --log-group-name $lg --retention-in-days 30 --region $Region
        Write-Host "Set retention(30d) for $lg" -ForegroundColor Green
    } catch {
        Write-Host "Failed to set retention for ${lg}: $_" -ForegroundColor Red
    }
}

Write-Host "Step 5: Creating Origin Access Control" -ForegroundColor Yellow
try {
    $oacOutput = aws cloudfront create-origin-access-control `
        --origin-access-control-config `
        "Name=${BucketName}-oac,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4" `
        --output json | ConvertFrom-Json
    
    $oacId = $oacOutput.OriginAccessControl.Id
    Write-Host "OAC ID: $oacId" -ForegroundColor Green
} catch {
    # Try to get existing OAC
    $oacList = aws cloudfront list-origin-access-controls --output json | ConvertFrom-Json
    $oac = $oacList.OriginAccessControlList.Items | Where-Object { $_.Name -eq "${BucketName}-oac" }
    if ($oac) {
        $oacId = $oac.Id
        Write-Host "OAC already exists: $oacId" -ForegroundColor Green
    } else {
        Write-Host "Error: Could not create or find OAC" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 6: Creating CloudFront Distribution" -ForegroundColor Yellow
Write-Host "Note: This step requires manual completion in AWS Console or CloudFormation" -ForegroundColor Yellow
Write-Host "CloudFront distributions are complex to create via CLI."
Write-Host "Please use one of the following:"
Write-Host "  1. Use Terraform (see infrastructure/terraform/)"
Write-Host "  2. Use AWS Console: https://console.aws.amazon.com/cloudfront"
Write-Host "  3. Use CloudFormation template (see infrastructure/cloudformation/)"
Write-Host ""
Write-Host "Required configuration:"
Write-Host "  - Origin Domain: $BucketName.s3.$Region.amazonaws.com"
Write-Host "  - Origin Access: Origin Access Control"
Write-Host "  - OAC ID: $oacId"
Write-Host "  - Viewer Protocol: Redirect HTTP to HTTPS"
Write-Host "  - Allowed Methods: GET, HEAD, OPTIONS"
Write-Host "  - Cache Policy: Custom (1 year TTL)"
Write-Host ""

Write-Host "Step 7: Updating S3 Bucket Policy" -ForegroundColor Yellow
Write-Host "After creating the CloudFront distribution, update the bucket policy."
Write-Host "See infrastructure/s3-bucket-policy.json for the policy template."
Write-Host "Replace DISTRIBUTION_ID and ACCOUNT_ID with your values."
Write-Host ""

Write-Host "Step 8: Storing OTel settings in SSM Parameter Store" -ForegroundColor Yellow
try {
    aws ssm put-parameter --name "/selfcar/otel/endpoint" --type "String" --value $OtelEndpoint --overwrite --region $Region | Out-Null
    Write-Host "Stored /selfcar/otel/endpoint" -ForegroundColor Green
} catch {
    Write-Host "Failed to store OTEL endpoint: $_" -ForegroundColor Red
}

Write-Host "Setup Complete!" -ForegroundColor Green

# Optional: Patch ECS task definition with OTEL env vars and roll service
if ($EcsCluster -and $EcsService -and $EcsContainerName) {
    Write-Host "Step 9: Patching ECS Task Definition for OTEL" -ForegroundColor Yellow
    try {
        $svc = aws ecs describe-services --cluster $EcsCluster --services $EcsService --region $Region --output json | ConvertFrom-Json
        if (-not $svc.services -or $svc.services.Count -eq 0) { throw "ECS service not found" }
        $taskDefArn = $svc.services[0].taskDefinition

        $td = aws ecs describe-task-definition --task-definition $taskDefArn --region $Region --output json | ConvertFrom-Json
        $def = $td.taskDefinition

        # Clone and modify container definitions
        $containers = $def.containerDefinitions | ConvertTo-Json -Depth 100 | ConvertFrom-Json
        foreach ($c in $containers) {
            if ($c.name -eq $EcsContainerName) {
                if (-not $c.environment) { $c.environment = @() }
                # helper to upsert env var
                function Update-Env([ref]$arr, [string]$name, [string]$value) {
                    $existing = $arr.Value | Where-Object { $_.name -eq $name }
                    if ($existing) { $existing.value = $value } else { $arr.Value += @{ name = $name; value = $value } }
                }
                Update-Env ([ref]$c.environment) "OTEL_EXPORTER_OTLP_ENDPOINT" $OtelEndpoint
                Update-Env ([ref]$c.environment) "OTEL_TRACES_EXPORTER" "otlp"
                Update-Env ([ref]$c.environment) "OTEL_METRICS_EXPORTER" "none"
                Update-Env ([ref]$c.environment) "OTEL_SERVICE_NAME" $OtelServiceName
            }
        }

        $regPayload = @{
            family                   = $def.family
            taskRoleArn              = $def.taskRoleArn
            executionRoleArn         = $def.executionRoleArn
            networkMode              = $def.networkMode
            containerDefinitions     = $containers
            requiresCompatibilities  = $def.requiresCompatibilities
            cpu                      = $def.cpu
            memory                   = $def.memory
            runtimePlatform          = $def.runtimePlatform
            volumes                  = $def.volumes
        } | ConvertTo-Json -Depth 100

        $newTd = aws ecs register-task-definition --cli-input-json $regPayload --region $Region --output json | ConvertFrom-Json
        $newArn = $newTd.taskDefinition.taskDefinitionArn
        Write-Host "Registered new task definition: $newArn" -ForegroundColor Green

        aws ecs update-service --cluster $EcsCluster --service $EcsService --task-definition $newArn --region $Region | Out-Null
        Write-Host "Updated ECS service to new task def" -ForegroundColor Green
    } catch {
        Write-Host "Failed to patch ECS task definition: $_" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Create CloudFront distribution (see above)"
Write-Host "2. Get CloudFront distribution ID and ARN"
Write-Host "3. Update S3 bucket policy with distribution ARN"
Write-Host "4. Configure environment variables with CloudFront domain"
Write-Host ""

