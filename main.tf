# ================= VPC =================
module "vpc" {
  source     = "./modules/vpc"
    
  cidr_block = var.cidr_block
  name       = var.vpc_name

  availability_zones = var.availability_zones
  private_subnet_cidrs = var.private_subnet_cidrs
}

# ================= VPC Endpoints =================

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
        Name = var.vpc_endpoint_s3_name
     }
    }
  }
}

# ================= S3 Buckets =================
module "s3_frontend" {
  source      = "./modules/s3"
  bucket_name = var.frontend_bucket_name
  is_website  = true
}

module "s3_images" {
  source      = "./modules/s3"
  bucket_name = var.images_bucket_name
  is_website  = false
}

# ================= Security Groups =================
module "security_groups" {
  source = "./modules/security-groups"

  lambda_sg_name   = var.lambda_sg_name
  rdsproxy_sg_name = var.rds_proxy_sg_name
  mysql_sg_name    = var.my_sql_sg_name
  vpc_id           = module.vpc.id 

}

# ================= RDS MySQL =================
module "rds_mysql" {
  depends_on = [module.vpc, module.security_groups]
  source = "./modules/rds"

  name                   = var.rds_db_identifier
  db_identifier          = var.rds_db_identifier
  db_name                = var.rds_db_name
  username               = var.rds_db_username
  password               = var.rds_db_password

  subnet_ids             = data.aws_subnets.rds_subnets.ids
  vpc_security_group_ids = [module.security_groups.mysql_sg_id]
}