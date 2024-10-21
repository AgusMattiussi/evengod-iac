data "aws_region" "current" {}

# Create the initial API Gateway without the body
resource "aws_api_gateway_rest_api" "this" {
  name        = var.api_name
  description = var.api_description
}

# Create the deployment with a stage
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = var.stage_name

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_integration.lambda_integrations]
}

# Construct the URL
locals {
  api_gateway_url = "https://${aws_api_gateway_rest_api.this.id}.execute-api.${data.aws_region.current.name}.amazonaws.com"
}

# Create Lambda permissions
resource "aws_lambda_permission" "api_gateway" {
  for_each = var.lambda_function_arns

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

# Create API Gateway resources and methods
resource "aws_api_gateway_resource" "lambda_resources" {
  for_each = var.lambda_function_arns

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = each.key
}

resource "aws_api_gateway_method" "lambda_methods" {
  for_each = var.lambda_function_arns

  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.lambda_resources[each.key].id
  http_method   = "POST"  # You might want to make this configurable
  authorization = "NONE"  # Adjust as needed
}

# Create API Gateway integrations
resource "aws_api_gateway_integration" "lambda_integrations" {
  for_each = var.lambda_function_arns

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.lambda_resources[each.key].id
  http_method = aws_api_gateway_method.lambda_methods[each.key].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${each.value}/invocations"
}

# Create a local variable with the updated OpenAPI spec
locals {
  updated_openapi_content = templatefile("${path.module}/openapi.json", {
    aws_region                 = data.aws_region.current.name
    api_gateway_url            = local.api_gateway_url
    getUserByIdLambdaArn       = var.lambda_function_arns["getUserById"]
    createUserLambdaArn        = var.lambda_function_arns["createUser"]
    editUserLambdaArn          = var.lambda_function_arns["editUser"]
    deleteUserLambdaArn        = var.lambda_function_arns["deleteUser"]
    getEventByIdLambdaArn      = var.lambda_function_arns["getEventById"]
    createEventLambdaArn       = var.lambda_function_arns["createEvent"]
    editEventLambdaArn         = var.lambda_function_arns["editEvent"]
    getEventsLambdaArn         = var.lambda_function_arns["getEvents"]
    getEventsByUserIdLambdaArn = var.lambda_function_arns["getEventsByUserId"]
    getCategoriesLambdaArn     = var.lambda_function_arns["getCategories"]
    getCategoryByIdLambdaArn   = var.lambda_function_arns["getCategoryById"]
    getInscriptionsLambdaArn   = var.lambda_function_arns["getInscriptions"]
    createInscriptionLambdaArn = var.lambda_function_arns["createInscription"]
    getInscriptionByIdLambdaArn= var.lambda_function_arns["getInscriptionById"]
    editInscriptionLambdaArn   = var.lambda_function_arns["editInscription"]
    getUserImgLambdaArn        = var.lambda_function_arns["getUserImg"]
    putUserImgLambdaArn        = var.lambda_function_arns["putUserImg"]
    getEventImgLambdaArn       = var.lambda_function_arns["getEventImg"]
    putEventImgLambdaArn       = var.lambda_function_arns["putEventImg"]
  })
}

# Use a null_resource to update the API with the body
resource "null_resource" "update_api" {
  triggers = {
    api_id = aws_api_gateway_rest_api.this.id
    openapi_hash = sha256(local.updated_openapi_content)
  }

  provisioner "local-exec" {
    command = <<EOF
echo '${local.updated_openapi_content}' > ${path.module}/updated_openapi.json
aws apigateway put-rest-api \
  --rest-api-id ${aws_api_gateway_rest_api.this.id} \
  --mode overwrite \
  --body file://${path.module}/updated_openapi.json
rm ${path.module}/updated_openapi.json
EOF
  }

  depends_on = [aws_api_gateway_deployment.this, aws_lambda_permission.api_gateway]
}

# Create a new deployment after updating the API
resource "aws_api_gateway_deployment" "update" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = var.stage_name

  triggers = {
    redeployment = sha1(local.updated_openapi_content)
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [null_resource.update_api]
}