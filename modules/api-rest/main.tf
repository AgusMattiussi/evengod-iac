resource "aws_api_gateway_rest_api" "this" {
    name = var.api_name
    description = var.api_description

    body = file("${path.module}/openapi.json")
}

resource "aws_api_gateway_deployment" "this" {
    depends_on = [aws_api_gateway_rest_api.this]
    rest_api_id = aws_api_gateway_rest_api.this.id
    stage_name  = var.stage_name
}