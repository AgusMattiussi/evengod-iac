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

resource "aws_route_table" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id = aws_vpc.this.id

  tags = {
    Name = "evengod-rt-private${count.index + 1}-${var.availability_zones[count.index % 2]}"
  }
}

resource "aws_route_table_association" "private" {
  count = length(var.private_subnet_cidrs)

  subnet_id      = module.private_subnet[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}