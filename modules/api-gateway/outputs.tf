output "execution_arn" {
  value = aws_api_gateway_rest_api.this.execution_arn
  description = "The execution ARN of the API Gateway"
}

output "invoke_url" {
  value = "${aws_api_gateway_stage.this.invoke_url}"
  description = "The URL to invoke the API Gateway"
}

output "id" {
  value = aws_api_gateway_rest_api.this.id
  description = "The ID of the API Gateway"
}

output "root_resource_id" {
  value = aws_api_gateway_rest_api.this.root_resource_id
  description = "The root resource ID of the API Gateway"
}