variable "name" {
  description = "Name for the RDS instance"
  type        = string
}

variable "allocated_storage" {
  description = "Storage capacity for the RDS instance"
  type        = number
  default     = 20
}

variable "instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t4g.micro"
}

variable "engine_version" {
  description = "Engine version for the RDS instance"
  type        = string
  default     = "8.0"
}

variable "db_identifier" {
  description = "Identifier for the RDS instance"
  type        = string
}

variable "db_name" {
  description = "Name for the database"
  type        = string
}

variable "username" {
  description = "Admin user for the database"
  type        = string
}

variable "password" {
  description = "Admin password for the database"
  type        = string
  sensitive   = true
}

variable "subnet_ids" {
  description = "List of subnet IDs for the RDS instance"
  type        = list(string)
}

variable "vpc_security_group_ids" {
  description = "List of security group IDs for the RDS instance"
  type        = list(string)
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}