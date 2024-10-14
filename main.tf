# ================= VPC =================
module "vpc" {
  source     = "./modules/vpc"
    
  cidr_block = "10.0.0.0/16"
  name       = "evengod-vpc"

  availability_zones = ["us-east-1a", "us-east-1b"]
  private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]
}

# ================= VPC Endpoints =================
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

module "vpc_endpoints" {
  depends_on = [module.vpc]

  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id = module.vpc.id

  endpoints = {
    s3 = {
      service             = "s3"
      service_type        = "Gateway"
      route_table_ids     = data.aws_route_tables.private_route_tables.ids
      policy = jsonencode({
        Version = "2008-10-17"
        Statement = [
        {
            "Effect" : "Allow",
            "Principal" : "*",
            "Action" : "*",
            "Resource" : "*"
        }
        ]
     })
     tags = {
        Name = "s3-images-vpc-endpoint"
     }
    }
  }
}

# ================= S3 Buckets =================
module "s3_frontend" {
  source      = "./modules/s3"
  bucket_name = "evengod-frontend"
  is_website  = true
}

module "s3_images" {
  source      = "./modules/s3"
  bucket_name = "evengod-images"
  is_website  = false
}

# ================= Security Groups =================
module "security_groups" {
  source = "./modules/security-groups"

  lambda_sg_name   = "lambda-sg"
  rdsproxy_sg_name = "rdsproxy-sg"
  mysql_sg_name    = "mysql-sg"
  vpc_id           = module.vpc.id 

}

# ================= RDS MySQL =================
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

module "rds_mysql" {
  depends_on = [module.vpc, module.security_groups]
  source = "./modules/rds"

  name                   = "evengod-db"
  instance_class         = "db.t4g.micro"
  engine_version         = "8.0.35"
  db_identifier          = "evengod-db"
  db_name                = "evengoddb"
  username               = "admin" # TODO: use secrets manager
  password               = "admin123"

  subnet_ids             = data.aws_subnets.rds_subnets.ids
  vpc_security_group_ids = [module.security_groups.mysql_sg_id]
}