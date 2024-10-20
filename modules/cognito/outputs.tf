output "id" {
  value = aws_cognito_user_pool.this.id
  description = "The id of the user pool"
}

output "domain" {
  value = aws_cognito_user_pool_domain.domain.domain
  description = "The domain of the user pool"
}