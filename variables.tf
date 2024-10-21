variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block of the VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of Availability Zones for the VPC"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for the private subnets"
  type        = list(string)
}

variable "images_bucket_name" {
  description = "Name of the S3 bucket for images"
  type        = string
}

variable "frontend_bucket_name" {
  description = "Name of the S3 bucket for the frontend"
  type        = string
}

variable "lambda_sg_name" {
  description = "Name of the security group for Lambda"
  type        = string
}

variable "rds_proxy_sg_name" {
  description = "Name of the security group for RDS Proxy"
  type        = string
}

variable "my_sql_sg_name" {
  description = "Name of the security group for MySQL"
  type        = string
}

variable "rds_db_identifier" {
  description = "Identifier for the RDS instance"
  type        = string
}

variable "rds_db_name" {
  description = "Name of the database in RDS"
  type        = string
}

variable "rds_db_username" {
  description = "Username for the RDS database"
  type        = string
}

variable "rds_db_password" {
  description = "Password for the RDS database user"
  type        = string
}

variable "vpc_endpoint_s3_name" {
  description = "Name of the VPC endpoint for S3"
  type        = string
}

variable "cognito_domain" {
  description = "Domain for the Cognito user pool"
  type        = string
}

variable "google_client_id" {
  description = "value of the google client id"
  type        = string
}

variable "google_client_secret" {
  description = "value of the google client secret"
  type        = string
}

variable "user_pool_name" {
  description = "Name of the Cognito user pool"
  type        = string
}

variable "lambda_functions" {
  description = "List of Lambda functions to deploy"
  type        = list(object({
    name    = string
    handler = string
    runtime = string
    source_dir = string
  }))
}

variable "api_name" {
  description = "Name of the API"
  type        = string
}

variable "api_description" {
  description = "Description of the API"
  type        = string
  default     = "API description"
}

variable "stage_name" {
  description = "Name of the API stage"
  type        = string
  default     = "prod"
}