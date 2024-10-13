variable "vpc_id" {
    description = "The ID of the VPC where subnets will be created"
    type        = string
}

variable "subnet_cidr" {
    description = "The CIDR block for the subnet"
    type        = string
}

variable "availability_zone" {
    description = "The availability zone where the subnet will be created"
    type        = string
}

variable "name" {
    description = "The name of the subnet"
    type        = string
    default     = "my-subnet"
}