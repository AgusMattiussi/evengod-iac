variable "api_name" {
  description = "Nombre de la API"
  type        = string
}

variable "api_description" {
  description = "Descripción de la API"
  type        = string
  default     = "API description"
}

variable "stage_name" {
  description = "Nombre del stage para la API"
  type        = string
  default     = "dev"
}

variable "lambda_function_arns" {
  type = map(string)
}