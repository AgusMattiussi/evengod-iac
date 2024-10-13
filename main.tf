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