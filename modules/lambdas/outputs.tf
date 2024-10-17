output "lambda_layer_arn" {
  description = "ARN of the Lambda Layer"
  value       = aws_lambda_layer_version.common_dependencies.arn
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.function.arn
}

output "lambda_role_arn" {
  description = "ARN of the IAM role used by the Lambda functions"
  value       = aws_iam_role.lambda_role.arn
}