output "api_id" {
  description = "ID de la API REST"
  value       = aws_api_gateway_rest_api.this.id
}

output "api_url" {
  description = "URL de la API"
  value       = aws_api_gateway_deployment.this.invoke_url
}