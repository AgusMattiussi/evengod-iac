output "api_id" {
  description = "ID de la API REST"
  value       = aws_api_gateway_rest_api.this.id
}

output "invoke_url" {
  description = "URL para invocar la API"
  value       = aws_api_gateway_deployment.this.invoke_url
}