output "id" {
    description = "ID of the VPC"
    value       = aws_vpc.this.id
}

output "cidr" {
    description = "CIDR block for the VPC"
    value       = aws_vpc.this.cidr_block
}