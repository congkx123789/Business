terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for remote state
  # backend "s3" {
  #   bucket = "selfcar-terraform-state"
  #   key    = "image-optimization/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SelfCar"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Component   = "ImageOptimization"
    }
  }
}

# CloudWatch Log Groups for services
resource "aws_cloudwatch_log_group" "services" {
  for_each          = toset(var.log_group_names)
  name              = each.value
  retention_in_days = 30
  tags = {
    Purpose = "ApplicationLogs"
  }
}

# Optional: OpenSearch domain for centralized logs (small dev size)
resource "aws_opensearch_domain" "logs" {
  count = var.enable_opensearch ? 1 : 0
  domain_name           = var.opensearch_domain_name
  engine_version        = "OpenSearch_2.11"
  cluster_config {
    instance_type  = "t3.small.search"
    instance_count = 1
    zone_awareness_enabled = false
  }
  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = 20
  }
  encrypt_at_rest {
    enabled = true
  }
  node_to_node_encryption {
    enabled = true
  }
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }
  access_policies = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = { AWS = "*" },
        Action = ["es:ESHttp*"],
        Resource = "*"
      }
    ]
  })
}

############################
# Log shipping via Firehose
############################

# S3 backup bucket for Firehose failures (optional but recommended)
resource "aws_s3_bucket" "logs_backup" {
  count  = var.enable_log_shipping ? 1 : 0
  bucket = "selfcar-logs-backup-${var.environment}-${var.aws_region}"
}

resource "aws_iam_role" "firehose_role" {
  count = var.enable_log_shipping ? 1 : 0
  name  = "selfcar-firehose-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "firehose.amazonaws.com" },
      Action   = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "firehose_policy" {
  count = var.enable_log_shipping ? 1 : 0
  name  = "selfcar-firehose-policy-${var.environment}"
  role  = aws_iam_role.firehose_role[0].id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect : "Allow",
        Action : ["s3:AbortMultipartUpload","s3:GetBucketLocation","s3:GetObject","s3:ListBucket","s3:ListBucketMultipartUploads","s3:PutObject","s3:PutObjectAcl","s3:ListMultipartUploadParts"],
        Resource : [
          aws_s3_bucket.logs_backup[0].arn,
          "${aws_s3_bucket.logs_backup[0].arn}/*"
        ]
      },
      {
        Effect : "Allow",
        Action : ["es:ESHttp*"],
        Resource : "*"
      },
      {
        Effect : "Allow",
        Action : ["logs:PutSubscriptionFilter", "logs:DeleteSubscriptionFilter", "logs:PutLogEvents"],
        Resource : "*"
      }
    ]
  })
}

resource "aws_kinesis_firehose_delivery_stream" "cw_to_opensearch" {
  count       = var.enable_log_shipping && var.enable_opensearch ? 1 : 0
  name        = "selfcar-cw-to-opensearch-${var.environment}"
  destination = "opensearch"

  opensearch_configuration {
    domain_arn        = aws_opensearch_domain.logs[0].arn
    role_arn          = aws_iam_role.firehose_role[0].arn
    index_name        = "${var.opensearch_index_prefix}-${var.environment}"
    buffering_interval = 60
    buffering_size     = 5
    s3_backup_mode     = "FailedDocumentsOnly"
    cluster_endpoint   = aws_opensearch_domain.logs[0].endpoint

    s3_configuration {
      role_arn           = aws_iam_role.firehose_role[0].arn
      bucket_arn         = aws_s3_bucket.logs_backup[0].arn
      buffering_interval = 300
      buffering_size     = 5
      compression_format = "GZIP"
    }
  }
}

# Allow CloudWatch Logs to put data into Firehose
resource "aws_iam_role" "cw_logs_role" {
  count = var.enable_log_shipping ? 1 : 0
  name  = "selfcar-cw-logs-to-firehose-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "logs.${var.aws_region}.amazonaws.com" },
      Action   = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cw_logs_policy" {
  count = var.enable_log_shipping ? 1 : 0
  name  = "selfcar-cw-logs-to-firehose-policy-${var.environment}"
  role  = aws_iam_role.cw_logs_role[0].id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect : "Allow",
      Action : ["firehose:PutRecord", "firehose:PutRecordBatch"],
      Resource : try(aws_kinesis_firehose_delivery_stream.cw_to_opensearch[0].arn, null)
    }]
  })
}

# Subscription filters from each CW log group to Firehose
resource "aws_cloudwatch_log_subscription_filter" "to_firehose" {
  for_each = var.enable_log_shipping && var.enable_opensearch ? toset(var.log_group_names) : []
  name            = "selfcar-subscription-${replace(each.value, "/", "-")}"
  log_group_name  = each.value
  destination_arn = aws_kinesis_firehose_delivery_stream.cw_to_opensearch[0].arn
  role_arn        = aws_iam_role.cw_logs_role[0].arn
  filter_pattern  = "" # everything
  depends_on      = [aws_kinesis_firehose_delivery_stream.cw_to_opensearch]
}

# CloudFront Cache Policy for images (long TTL, query string passthrough for transforms)
resource "aws_cloudfront_cache_policy" "images_cache_policy" {
  name = "selfcar-images-cache-policy"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "whitelist"
      query_strings {
        items    = ["width", "height", "format", "quality", "focus"]
        quantity = 5
      }
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }

  default_ttl = 604800
  max_ttl     = 604800
  min_ttl     = 86400
}

# Minimal origin request policy (reduces variance, helps collapsing)
resource "aws_cloudfront_origin_request_policy" "minimal_origin_policy" {
  name = "selfcar-minimal-origin-request-policy"

  cookies_config {
    cookie_behavior = "none"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items    = ["Origin"]
      quantity = 1
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

# Short TTL cache policy for dynamic API/HTML with fast revalidation
resource "aws_cloudfront_cache_policy" "short_ttl_api_policy" {
  name = "selfcar-short-ttl-api-policy"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "all"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }

  default_ttl = 300   # 5 minutes
  max_ttl     = 600   # 10 minutes
  min_ttl     = 60    # 1 minute
}

# S3 Bucket for Images
resource "aws_s3_bucket" "images" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "SelfCar Images Storage"
    Description = "Private S3 bucket for car images, accessed only via CloudFront"
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning (optional, for recovery)
resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Disabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "images" {
  name                              = "${var.s3_bucket_name}-oac"
  description                       = "OAC for SelfCar images bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "images" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "SelfCar Images CDN"
  default_root_object = "index.html"

  # Origin
  origin {
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.images.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.images.id

    # Origin Shield for origin protection and request collapsing
    origin_shield {
      enabled              = true
      origin_shield_region = var.origin_shield_region
    }
  }

  # Default cache behavior - Images (7 days CDN cache)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.images.id}"

    # Use modern cache and origin request policies for minimal variance
    cache_policy_id            = aws_cloudfront_cache_policy.images_cache_policy.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.minimal_origin_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 86400      # 1 day minimum
    default_ttl            = 604800     # 7 days default (CDN layer)
    max_ttl                = 604800     # 7 days maximum
    compress               = true
  }

  # Additional behavior example for dynamic API with short TTLs (can be extended)
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "S3-${aws_s3_bucket.images.id}"
    cache_policy_id          = aws_cloudfront_cache_policy.short_ttl_api_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.minimal_origin_policy.id
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true
  }

  # Custom error pages (optional)
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
  }

  # Price class (optimize costs)
  price_class = var.cloudfront_price_class

  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Viewer certificate
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "SelfCar Images CDN"
  }
}

# CloudFront origin error rate and request anomaly alarms
resource "aws_cloudwatch_metric_alarm" "cf_origin_error_rate" {
  count               = var.enable_cloudfront_alarms ? 1 : 0
  alarm_name          = "selfcar-cf-origin-5xx-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = var.cloudfront_origin_error_threshold
  metric_name         = "OriginErrorRate"
  namespace           = "AWS/CloudFront"
  statistic           = "Average"
  period              = 300
  dimensions = {
    DistributionId = aws_cloudfront_distribution.images.id
    Region         = "Global"
  }
  alarm_description = "CloudFront origin error rate high"
}

resource "aws_cloudwatch_metric_alarm" "cf_origin_requests_anomaly" {
  count               = var.enable_cloudfront_alarms ? 1 : 0
  alarm_name          = "selfcar-cf-origin-requests-anomaly-${var.environment}"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "ad1"
  metric_query {
    id          = "m1"
    return_data = false
    metric {
      metric_name = "OriginRequests"
      namespace   = "AWS/CloudFront"
      period      = 300
      stat        = "Average"
      dimensions = {
        DistributionId = aws_cloudfront_distribution.images.id
        Region         = "Global"
      }
    }
  }
  metric_query {
    id          = "ad1"
    return_data = true
    expression  = "ANOMALY_DETECTION_BAND(m1)"
  }
  alarm_description = "CloudFront origin requests anomaly detected"
}

# S3 Bucket Policy - Allow CloudFront access
resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.images.arn
          }
        }
      },
      {
        Sid    = "DenyDirectAccess"
        Effect = "Deny"
        Principal = "*"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
        Condition = {
          StringNotEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.images.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.images]
}

# Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.images.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.images.arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.images.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.images.domain_name
}

output "cloudfront_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.images.arn
}

output "oac_id" {
  description = "Origin Access Control ID"
  value       = aws_cloudfront_origin_access_control.images.id
}

output "cdn_url" {
  description = "CDN URL for images"
  value       = "https://${aws_cloudfront_distribution.images.domain_name}"
}

