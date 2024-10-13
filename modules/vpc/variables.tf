variable "cidr_block" {
    description = "The CIDR block for the VPC"
    type        = string
}

variable "name" {
    description = "The name of the VPC"
    type        = string
    default     = "my-vpc"
}

variable "availability_zones" {
    description = "List of availability zones to distribute the subnets"
    type        = list(string)
}

variable "private_subnet_cidrs" {
    description = "List of CIDR blocks for the private subnets"
    type        = list(string)
}