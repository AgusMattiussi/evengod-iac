output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.function.function_name
}

output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.function.arn
}


output "source_code_hash" {
  description = "Base64-encoded representation of the Lambda function's deployment package"
  value       = aws_lambda_function.function.source_code_hash
}