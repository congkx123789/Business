variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for images"
  type        = string
  default     = "selfcar-images-prod"
  
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.s3_bucket_name))
    error_message = "S3 bucket name must be lowercase, alphanumeric, and may contain hyphens."
  }
}

variable "enable_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = false
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_200"
  
  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All"
  }
}

variable "enable_cloudfront_alarms" {
  description = "Create CloudFront origin error/request anomaly alarms"
  type        = bool
  default     = true
}

variable "cloudfront_origin_error_threshold" {
  description = "Threshold for 5xx origin error rate (%)"
  type        = number
  default     = 2
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "enable_opensearch" {
  description = "Create an OpenSearch domain for centralized logs"
  type        = bool
  default     = false
}

variable "opensearch_domain_name" {
  description = "OpenSearch domain name"
  type        = string
  default     = "selfcar-logs"
}

variable "log_group_names" {
  description = "CloudWatch log groups to create for services"
  type        = list(string)
  default     = [
    "/selfcar/backend",
    "/selfcar/inventory-pipeline",
    "/selfcar/search-api"
  ]
}

variable "enable_log_shipping" {
  description = "Enable CloudWatch Logs -> Firehose -> OpenSearch pipeline"
  type        = bool
  default     = false
}

variable "opensearch_index_prefix" {
  description = "Index prefix for OpenSearch log indices"
  type        = string
  default     = "selfcar-logs"
}

