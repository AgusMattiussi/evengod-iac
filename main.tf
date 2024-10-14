module "vpc" {
  source     = "./modules/vpc"
    
  cidr_block = "10.0.0.0/16"
  name       = "evengod-vpc"

  availability_zones = ["us-east-1a", "us-east-1b"]
  private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]
}

module "s3" {
  source = "./modules/s3"
  bucket_name = "evengod-cloud"
}

module "security_groups" {
  source = "./modules/security-groups"

  lambda_sg_name   = "lambda-sg"
  rdsproxy_sg_name = "rdsproxy-sg"
  mysql_sg_name    = "mysql-sg"
  vpc_id           = module.vpc.id 

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

  subnet_ids            = data.aws_subnets.rds_subnets.ids
  vpc_security_group_ids = [module.security_groups.mysql_sg_id]
}