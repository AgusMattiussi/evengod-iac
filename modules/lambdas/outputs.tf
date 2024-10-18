output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.function.function_name
}

output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.function.arn
}

output "last_modified" {
  description = "Date this resource was last modified"
  value       = aws_lambda_function.function.last_modified
}
