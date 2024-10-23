data "aws_region" "current" {}

locals {
  lambda_uri_prefix = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions"
}


# CREATE USER
resource "aws_api_gateway_method" "create_user" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["users"]
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_user" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["users"]
  http_method = aws_api_gateway_method.create_user.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["createUser"]}/invocations"
}

# GET USER BY ID
resource "aws_api_gateway_method" "get_user" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["user_id"]
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_user" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["user_id"]
  http_method = aws_api_gateway_method.get_user.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getUserById"]}/invocations"
}

# UPDATE USER BY ID
resource "aws_api_gateway_method" "update_user" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["user_id"]
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "update_user" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["user_id"]
  http_method = aws_api_gateway_method.update_user.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["editUser"]}/invocations"
}

# DELETE USER BY ID
resource "aws_api_gateway_method" "delete_user" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["user_id"]
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "delete_user" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["user_id"]
  http_method = aws_api_gateway_method.delete_user.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["deleteUser"]}/invocations"
}

# GET USER EVENTS BY ID
resource "aws_api_gateway_method" "get_user_events" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["user_events"]
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_user_events" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["user_events"]
  http_method = aws_api_gateway_method.get_user_events.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getEventsByUserId"]}/invocations"
}

# GET USER IMAGE BY ID
resource "aws_api_gateway_method" "get_user_image" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["user_image"]
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_user_image" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["user_image"]
  http_method = aws_api_gateway_method.get_user_image.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getUserImg"]}/invocations"
}

# PUT USER IMAGE BY ID
resource "aws_api_gateway_method" "put_user_image" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["user_image"]
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_user_image" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["user_image"]
  http_method = aws_api_gateway_method.put_user_image.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["putUserImg"]}/invocations"
}

# GET EVENTS
resource "aws_api_gateway_method" "get_events" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["events"]
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_events" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["events"]
  http_method = aws_api_gateway_method.get_events.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getEvents"]}/invocations"
}

# CREATE EVENT
resource "aws_api_gateway_method" "create_event" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["events"]
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id
}

resource "aws_api_gateway_integration" "create_event" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["events"]
  http_method = aws_api_gateway_method.create_event.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["createEvent"]}/invocations"
}

# GET EVENT BY ID
resource "aws_api_gateway_method" "get_event" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["event_id"]
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_event" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["event_id"]
  http_method = aws_api_gateway_method.get_event.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getEventById"]}/invocations"
}

# UPDATE EVENT BY ID
resource "aws_api_gateway_method" "update_event" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["event_id"]
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "update_event" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["event_id"]
  http_method = aws_api_gateway_method.update_event.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["editEvent"]}/invocations"
}

# GET EVENT IMAGE BY ID
resource "aws_api_gateway_method" "get_event_image" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["event_image"]
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_event_image" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["event_image"]
  http_method = aws_api_gateway_method.get_event_image.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getEventImg"]}/invocations"
}

# PUT EVENT IMAGE BY ID
resource "aws_api_gateway_method" "put_event_image" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["event_image"]
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_event_image" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["event_image"]
  http_method = aws_api_gateway_method.put_event_image.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["putEventImg"]}/invocations"
}

# GET CATEGORIES
resource "aws_api_gateway_method" "get_categories" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["categories"]
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_categories" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["categories"]
  http_method = aws_api_gateway_method.get_categories.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getCategories"]}/invocations"
}

# GET CATEGORY BY ID
resource "aws_api_gateway_method" "get_category" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["category_id"]
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_category" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["category_id"]
  http_method = aws_api_gateway_method.get_category.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getCategoryById"]}/invocations"
}

# GET INSCRIPTIONS 
resource "aws_api_gateway_method" "get_inscriptions" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["inscriptions"]
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id
}

resource "aws_api_gateway_integration" "get_inscriptions" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["inscriptions"]
  http_method = aws_api_gateway_method.get_inscriptions.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getInscriptions"]}/invocations"
}

# CREATE INSCRIPTION
resource "aws_api_gateway_method" "create_inscription" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["inscriptions"]
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id
}

resource "aws_api_gateway_integration" "create_inscription" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["inscriptions"]
  http_method = aws_api_gateway_method.create_inscription.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["createInscription"]}/invocations"
}

# GET INSCRIPTION BY ID
resource "aws_api_gateway_method" "get_inscription" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["inscription_id"]
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_inscription" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["inscription_id"]
  http_method = aws_api_gateway_method.get_inscription.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["getInscriptionById"]}/invocations"
}

resource "aws_api_gateway_method" "update_inscription" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resources["inscription_id"]
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.id" = true
  }
}

# UPDATE INSCRIPTION BY ID
resource "aws_api_gateway_integration" "update_inscription" {
  rest_api_id = var.rest_api_id
  resource_id = var.resources["inscription_id"]
  http_method = aws_api_gateway_method.update_inscription.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${local.lambda_uri_prefix}/${var.lambda_functions["editInscription"]}/invocations"
}

# Method Responses for all methods
locals {
  methods = {
    "create_user"        = aws_api_gateway_method.create_user
    "get_user"           = aws_api_gateway_method.get_user
    "update_user"        = aws_api_gateway_method.update_user
    "delete_user"        = aws_api_gateway_method.delete_user
    "get_user_events"    = aws_api_gateway_method.get_user_events
    "get_user_image"     = aws_api_gateway_method.get_user_image
    "put_user_image"     = aws_api_gateway_method.put_user_image
    "get_events"         = aws_api_gateway_method.get_events
    "create_event"       = aws_api_gateway_method.create_event
    "get_event"          = aws_api_gateway_method.get_event
    "update_event"       = aws_api_gateway_method.update_event
    "get_event_image"    = aws_api_gateway_method.get_event_image
    "put_event_image"    = aws_api_gateway_method.put_event_image
    "get_categories"     = aws_api_gateway_method.get_categories
    "get_category"       = aws_api_gateway_method.get_category
    "get_inscriptions"   = aws_api_gateway_method.get_inscriptions
    "create_inscription" = aws_api_gateway_method.create_inscription
    "get_inscription"    = aws_api_gateway_method.get_inscription
    "update_inscription" = aws_api_gateway_method.update_inscription
  }
}

# Add method responses for all methods
resource "aws_api_gateway_method_response" "response_200" {
  for_each = local.methods

  rest_api_id = var.rest_api_id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# Add integration responses for all methods
resource "aws_api_gateway_integration_response" "integration_response_200" {
  for_each = local.methods

  rest_api_id = var.rest_api_id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  status_code = aws_api_gateway_method_response.response_200[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.create_user,
    aws_api_gateway_integration.get_user,
    aws_api_gateway_integration.update_user,
    aws_api_gateway_integration.delete_user,
    aws_api_gateway_integration.get_user_events,
    aws_api_gateway_integration.get_user_image,
    aws_api_gateway_integration.put_user_image,
    aws_api_gateway_integration.get_events,
    aws_api_gateway_integration.create_event,
    aws_api_gateway_integration.get_event,
    aws_api_gateway_integration.update_event,
    aws_api_gateway_integration.get_event_image,
    aws_api_gateway_integration.put_event_image,
    aws_api_gateway_integration.get_categories,
    aws_api_gateway_integration.get_category,
    aws_api_gateway_integration.get_inscriptions,
    aws_api_gateway_integration.create_inscription,
    aws_api_gateway_integration.get_inscription,
    aws_api_gateway_integration.update_inscription
  ]
}

# Add error responses
resource "aws_api_gateway_method_response" "error_responses" {
  for_each = {
    for pair in setproduct(keys(local.methods), ["400", "401", "403", "404", "500"]) :
    "${pair[0]}_${pair[1]}" => {
      method_key  = pair[0]
      status_code = pair[1]
    }
  }

  rest_api_id = var.rest_api_id
  resource_id = local.methods[each.value.method_key].resource_id
  http_method = local.methods[each.value.method_key].http_method
  status_code = each.value.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Error"
  }
}

resource "aws_api_gateway_integration_response" "error_integration_responses" {
  for_each = {
    for pair in setproduct(keys(local.methods), ["400", "401", "403", "404", "500"]) :
    "${pair[0]}_${pair[1]}" => {
      method_key = pair[0]
      status_code = pair[1]
    }
  }

  rest_api_id = var.rest_api_id
  resource_id = local.methods[each.value.method_key].resource_id
  http_method = local.methods[each.value.method_key].http_method
  status_code = each.value.status_code

  selection_pattern = each.value.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_method_response.error_responses,
    aws_api_gateway_integration.create_user,
    aws_api_gateway_integration.get_user,
    aws_api_gateway_integration.update_user,
    aws_api_gateway_integration.delete_user,
    aws_api_gateway_integration.get_user_events,
    aws_api_gateway_integration.get_user_image,
    aws_api_gateway_integration.put_user_image,
    aws_api_gateway_integration.get_events,
    aws_api_gateway_integration.create_event,
    aws_api_gateway_integration.get_event,
    aws_api_gateway_integration.update_event,
    aws_api_gateway_integration.get_event_image,
    aws_api_gateway_integration.put_event_image,
    aws_api_gateway_integration.get_categories,
    aws_api_gateway_integration.get_category,
    aws_api_gateway_integration.get_inscriptions,
    aws_api_gateway_integration.create_inscription,
    aws_api_gateway_integration.get_inscription,
    aws_api_gateway_integration.update_inscription
  ]
}
