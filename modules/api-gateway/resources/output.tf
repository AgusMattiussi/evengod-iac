output "resources" {
  value = {
    users          = aws_api_gateway_resource.users.id
    user_id        = aws_api_gateway_resource.user_id.id
    user_events    = aws_api_gateway_resource.user_events.id
    user_image     = aws_api_gateway_resource.user_image.id
    events         = aws_api_gateway_resource.events.id
    event_id       = aws_api_gateway_resource.event_id.id
    event_image    = aws_api_gateway_resource.event_image.id
    categories     = aws_api_gateway_resource.categories.id
    category_id    = aws_api_gateway_resource.category_id.id
    inscriptions   = aws_api_gateway_resource.inscriptions.id
    inscription_id = aws_api_gateway_resource.inscription_id.id
  }
}