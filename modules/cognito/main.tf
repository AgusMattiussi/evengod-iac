# TODO:
# - Federated Identity Providers: Google, Apple.
# - MFA
# - App client

resource "aws_cognito_user_pool" "this" {
  name = var.user_pool_name

  username_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  mfa_configuration = "OFF"


  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Required default attributes
  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = true
  }

  # Our custom attributes
  schema {
    name                = "description"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      max_length = 2048
    }
  }

  schema {
    name                = "homeplace"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      max_length = 100
    }
  }



}

resource "aws_cognito_user_pool_domain" "domain" {
  domain       = var.domain
  user_pool_id = aws_cognito_user_pool.this.id
  depends_on   = [aws_cognito_user_pool.this]
}

resource "aws_cognito_user_pool_client" "userpool_client" {
  name         = "evengod-client"
  user_pool_id = aws_cognito_user_pool.this.id
  # TODO: Actualizar
  callback_urls                        = ["http://localhost"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "aws.cognito.signin.user.admin"]
  explicit_auth_flows                  = ["ALLOW_CUSTOM_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH"]
  generate_secret                      = false
  access_token_validity                = 1
  # logout_urls = [  ]
  supported_identity_providers = ["Google", "COGNITO"]

  depends_on = [
    aws_cognito_user_pool_domain.domain,
    aws_cognito_identity_provider.google
  ]

  lifecycle {
    create_before_destroy = true
  }
}


# =================== Google Log In =======================
resource "aws_cognito_identity_provider" "google" {
  provider_name = "Google"
  provider_type = "Google"
  user_pool_id  = aws_cognito_user_pool.this.id

  provider_details = {
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    authorize_scopes = "email profile openid"
  }

  attribute_mapping = {
    name = "name"
  }

  depends_on = [aws_cognito_user_pool.this]
}
