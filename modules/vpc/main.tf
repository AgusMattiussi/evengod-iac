resource "aws_vpc" "this" {
    cidr_block = var.cidr_block
    
    enable_dns_support   = true
    enable_dns_hostnames = true
    
    tags = {
        Name = var.name
    }
}

module "private_subnet" {
    source = "../subnet"

    count = length(var.private_subnet_cidrs)
    
    vpc_id            = aws_vpc.this.id
    availability_zone = var.availability_zones[count.index % 2]
    subnet_cidr       = var.private_subnet_cidrs[count.index]
    name              = "private-subnet-${count.index + 1}"
}