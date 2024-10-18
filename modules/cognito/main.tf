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
}