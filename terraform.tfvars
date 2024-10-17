vpc_name = "evengod-vpc"
cidr_block = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]

images_bucket_name = "evengod-images"
frontend_bucket_name = "evengod-frontend"

lambda_sg_name = "lambda-sg"
rds_proxy_sg_name = "rdsproxy-sg"
my_sql_sg_name = "mysql-sg"

rds_db_identifier = "evengod-db"
rds_db_name = "evengoddb"

# Entendemos que estas credenciales no corresponde que sean pusheadas pero las agregamos al archivo .tfvars para simplificar el deploy
rds_db_username = "admin"
rds_db_password = "admin123"

vpc_endpoint_s3_name = "s3-images-vpc-endpoint"

