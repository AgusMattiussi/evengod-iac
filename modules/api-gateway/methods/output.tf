output "method_arns" {
  value = {
    for key, method in local.methods :
    key => "${var.rest_api_id}/${var.stage_name}/${method.http_method}${method.resource_id}"
  }
}