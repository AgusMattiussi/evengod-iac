data "aws_route_tables" "private_route_tables" {
  filter {
    name   = "vpc-id"
    values = [module.vpc.id]
  }

  filter {
    name   = "tag:Name"
    values = ["*private*"]
  }
}

data "aws_subnets" "rds_subnets" {
  depends_on = [module.vpc]

  filter {
    name   = "vpc-id"
    values = [module.vpc.id]
  }

  filter {
    name   = "cidr-block"
    values = ["10.0.3.0/24", "10.0.4.0/24"]
  }
}
