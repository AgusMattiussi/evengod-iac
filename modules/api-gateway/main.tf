# modules/api-gateway/main.tf

resource "aws_api_gateway_rest_api" "this" {
  name        = var.api_name
  description = var.api_description

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_authorizer" "cognito" {
  name          = "${var.api_name}-cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  provider_arns = [var.cognito_user_pool_arn]
}

# Resources
module "api_resources" {
  source = "./resources"
  
  rest_api_id = aws_api_gateway_rest_api.this.id
  root_resource_id = aws_api_gateway_rest_api.this.root_resource_id
}

# Methods and Integrations
module "api_methods" {
  source = "./methods"
  
  rest_api_id     = aws_api_gateway_rest_api.this.id
  resources       = module.api_resources.resources
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  lambda_functions = var.lambda_function_arns
  stage_name       = var.stage_name
}

# CORS Configuration
module "cors" {
  source = "./cors"
  
  rest_api_id = aws_api_gateway_rest_api.this.id
  resources   = module.api_resources.resources
}

# Deployment
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      module.api_resources,
      module.api_methods,
      module.cors
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.api_methods,
    module.cors
  ]
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.stage_name
}

# Gateway responses for CORS
resource "aws_api_gateway_gateway_response" "response_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}

resource "aws_api_gateway_gateway_response" "response_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}