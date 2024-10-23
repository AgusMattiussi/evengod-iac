variable "resources" {
  type = map(string)
  description = "Map of resource names to their IDs where CORS needs to be enabled"
}

variable "rest_api_id" {
  type        = string
  description = "ID of the REST API Gateway"
}