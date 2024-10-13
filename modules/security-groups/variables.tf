variable "lambda_sg_name" {
    type        = string
    description = "Name of the Lambda Security Group"
}

variable "rdsproxy_sg_name" {
    type        = string
    description = "Name of the RDS Proxy Security Group"
}

variable "mysql_sg_name" {
    type        = string
    description = "Name of the MySQL Security Group"
}

variable "vpc_id" {
    type        = string
    description = "VPC ID where the Security Groups will be created"
}