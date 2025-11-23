# Outputs are defined in main.tf
# This file is kept for consistency with Terraform best practices


output "log_group_names" {
  description = "CloudWatch log groups created"
  value       = [for lg in aws_cloudwatch_log_group.services : lg.name]
}

output "opensearch_endpoint" {
  description = "OpenSearch endpoint (if enabled)"
  value       = try(aws_opensearch_domain.logs[0].endpoint, null)
}
