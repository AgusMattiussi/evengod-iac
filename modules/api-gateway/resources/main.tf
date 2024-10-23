# Users resources
resource "aws_api_gateway_resource" "users" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "user_id" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "user_events" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.user_id.id
  path_part   = "events"
}

resource "aws_api_gateway_resource" "user_image" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.user_id.id
  path_part   = "image"
}

# Events resources
resource "aws_api_gateway_resource" "events" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = "events"
}

resource "aws_api_gateway_resource" "event_id" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.events.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "event_image" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.event_id.id
  path_part   = "image"
}

# Categories resources
resource "aws_api_gateway_resource" "categories" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = "categories"
}

resource "aws_api_gateway_resource" "category_id" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.categories.id
  path_part   = "{id}"
}

# Inscriptions resources
resource "aws_api_gateway_resource" "inscriptions" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = "inscriptions"
}

resource "aws_api_gateway_resource" "inscription_id" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.inscriptions.id
  path_part   = "{id}"
}
