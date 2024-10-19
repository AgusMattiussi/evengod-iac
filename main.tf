# ================= VPC =================
module "vpc" {
  source = "./modules/vpc"

  cidr_block = var.cidr_block
  name       = var.vpc_name

  availability_zones   = var.availability_zones
  private_subnet_cidrs = var.private_subnet_cidrs
}

# ================= VPC Endpoints =================

module "vpc_endpoints" {
  depends_on = [module.vpc]

  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id = module.vpc.id

  endpoints = {
    s3 = {
      service         = "s3"
      service_type    = "Gateway"
      route_table_ids = data.aws_route_tables.private_route_tables.ids
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
resource "random_string" "random_suffix" {
  length  = 8
  special = false
  upper   = false
}

module "s3_frontend" {
  source      = "./modules/s3"
  bucket_name = "${var.frontend_bucket_name}-${random_string.random_suffix.result}"
  is_website  = true
}

module "s3_images" {
  source      = "./modules/s3"
  bucket_name = "${var.images_bucket_name}-${random_string.random_suffix.result}"
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
  source     = "./modules/rds"

  name          = var.rds_db_identifier
  db_identifier = var.rds_db_identifier
  db_name       = var.rds_db_name
  username      = var.rds_db_username
  password      = var.rds_db_password

  subnet_ids             = data.aws_subnets.rds_subnets.ids
  vpc_security_group_ids = [module.security_groups.mysql_sg_id]
}


# ================ Cognito =====================
module "cognito" {
  source = "./modules/cognito"
  
  domain          = "${var.cognito_domain}-${random_string.random_suffix.result}"
  user_pool_name  = var.user_pool_name

}


# ================= Lambda layer =================
resource "aws_lambda_layer_version" "mysql_dependencies" {
  filename   = "${path.module}/lambda_layer.zip"
  layer_name = "mysql-dependencies"

  compatible_runtimes = ["nodejs18.x", "nodejs20.x"]

  source_code_hash = filebase64sha256("${path.module}/lambda_layer.zip")
}

# ================= Lambda functions =================
module "lambda_functions" {
  depends_on = [module.security_groups, module.rds_mysql, module.s3_images]
  source     = "./modules/lambdas"
  for_each   = { for fn in var.lambda_functions : fn.name => fn }

  function_name          = each.value.name
  handler                = each.value.handler
  runtime                = each.value.runtime
  source_dir             = "${local.lambdas_dir}/${each.value.source_dir}"
  role                   = data.aws_iam_role.lab_role.arn
  layer_arn              = aws_lambda_layer_version.mysql_dependencies.arn
  vpc_subnet_ids         = module.vpc.private_subnets
  vpc_security_group_ids = [module.security_groups.lambda_sg_id]

  environment_variables = {
    RDS_PROXY      = module.rds_mysql.proxy_endpoint
    DB_USERNAME    = var.rds_db_username
    DB_PASSWORD    = var.rds_db_password
    DB_NAME        = var.rds_db_name
    S3_BUCKET_NAME = "${var.images_bucket_name}-${random_string.random_suffix.result}"
  }
}

# =============== REST API ===========================

module "api_gateway" {
  source = "./modules/api-rest"
  api_name = var.api_name
  api_description = var.api_description
  stage_name = var.stage_name
}
