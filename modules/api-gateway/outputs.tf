output "api_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.this.id
}

output "invoke_url" {
  description = "URL for invoking the API"
  value       = aws_api_gateway_deployment.this.invoke_url
}