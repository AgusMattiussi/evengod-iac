output "id" {
    description = "ID of the VPC"
    value       = aws_vpc.this.id
}

output "cidr" {
    description = "CIDR block for the VPC"
    value       = aws_vpc.this.cidr_block
}

output "private_subnets" {
  description = "IDs of the private subnets"
  value       = module.private_subnet.*.id
}