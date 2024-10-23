variable "rest_api_id" {
  type        = string
  description = "ID of the REST API Gateway"
}

variable "resources" {
  type        = map(string)
  description = "Map of resource names to their IDs"
}

variable "authorizer_id" {
  type        = string
  description = "ID of the Cognito authorizer"
}

variable "lambda_functions" {
  type        = map(string)
  description = "Map of Lambda function names to their ARNs"
}

variable "stage_name" {
  type        = string
  description = "Name of the API Gateway stage"
}