output "id" {
  value = aws_cognito_user_pool.this.id
  description = "The id of the user pool"
}

output "domain" {
  value = aws_cognito_user_pool_domain.domain.domain
  description = "The domain of the user pool"
}

output "arn" {
  value = aws_cognito_user_pool.this.arn
  description = "The ARN of the user pool"
}

output "client_id" {
  value = aws_cognito_user_pool_client.userpool_client.id
  description = "The client id of the user pool"
}