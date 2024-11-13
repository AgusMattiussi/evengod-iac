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
  depends_on = [module.vpc, module.security_groups]

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
    },
    // the sns endpoint is an Interface endpoint (it creates an ENI in the subnet)
    // and it is private (no public DNS)
    sns = {
      service = "sns"
      subnet_ids = [
        module.vpc.private_subnets[0], # Usa solo private-subnet-1 de us-east-1a
        module.vpc.private_subnets[1]  # Usa solo private-subnet-2 de us-east-1b
      ]
      vpc_endpoint_type   = "Interface"
      private_dns_enabled = true
      security_group_ids  = [module.security_groups.sns_endpoint_sg_id]
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
        Name = var.vpc_endpoint_sns_name
      }
    },
    events = {
      service             = "events"
      vpc_endpoint_type   = "Interface"
      subnet_ids          = [module.vpc.private_subnets[0], module.vpc.private_subnets[1]] # Una subnet por AZ
      private_dns_enabled = true
      security_group_ids  = [module.security_groups.events_endpoint_sg_id]
      policy = jsonencode({
        Version = "2008-10-17"
        Statement = [
          {
            Effect    = "Allow"
            Principal = "*"
            Action    = "*"
            Resource  = "*"
          }
        ]
      })
      tags = {
        Name = "events-vpc-endpoint"
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

  lambda_sg_name          = var.lambda_sg_name
  rdsproxy_sg_name        = var.rds_proxy_sg_name
  mysql_sg_name           = var.my_sql_sg_name
  sns_endpoint_sg_name    = var.sns_endpoint_sg_name
  events_endpoint_sg_name = var.events_endpoint_sg_name
  vpc_id                  = module.vpc.id

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

  rds_proxy_sg = [module.security_groups.rdsproxy_sg_id]

}


# ================ Cognito =====================
module "cognito" {
  source = "./modules/cognito"
  
  domain          = "${var.cognito_domain}-${random_string.random_suffix.result}"
  user_pool_name  = var.user_pool_name
  google_client_id = var.google_client_id
  google_client_secret = var.google_client_secret
}

# ================= Lambda layer =================
resource "aws_lambda_layer_version" "common_dependencies" {
  filename   = "${path.module}/lambda_layer.zip"
  layer_name = "common_dependencies"

  compatible_runtimes = ["nodejs18.x", "nodejs20.x"]

  source_code_hash = filebase64sha256("${path.module}/lambda_layer.zip")
}

# ================ SNS (Lambda listening to EventBridge for publications, and sends them through SNS) ================
module "sns_lambda_functions" {
  depends_on = [module.security_groups, module.rds_mysql, module.s3_images]
  source     = "./modules/sns_lambdas"
  for_each   = { for fn in var.sns_lambda_functions : fn.name => fn }

  function_name          = each.value.name
  handler                = each.value.handler
  runtime                = each.value.runtime
  source_dir             = "${local.lambdas_dir}/${each.value.source_dir}"
  role                   = data.aws_iam_role.lab_role.arn
  layer_arn              = aws_lambda_layer_version.common_dependencies.arn
  vpc_subnet_ids         = []
  vpc_security_group_ids = []

  environment_variables = {
    RDS_HOST       = module.rds_mysql.proxy_endpoint
    DB_USERNAME    = var.rds_db_username
    DB_PASSWORD    = var.rds_db_password
    DB_NAME        = var.rds_db_name
    S3_BUCKET_NAME = "${var.images_bucket_name}-${random_string.random_suffix.result}"
    USER_POOL_ID   = module.cognito.id
    CLIENT_ID      = module.cognito.client_id
  }
}


# ================= Lambda functions =================
locals {
  sns_lambda_functions_arn = {
    for name, lambda in module.sns_lambda_functions : name => lambda.function_arn
  }
}

module "lambda_functions" {
  depends_on = [module.sns_lambda_functions, module.security_groups, module.rds_mysql, module.s3_images]
  source     = "./modules/lambdas"
  for_each   = { for fn in var.lambda_functions : fn.name => fn }

  function_name          = each.value.name
  handler                = each.value.handler
  runtime                = each.value.runtime
  source_dir             = "${local.lambdas_dir}/${each.value.source_dir}"
  role                   = data.aws_iam_role.lab_role.arn
  layer_arn              = aws_lambda_layer_version.common_dependencies.arn
  vpc_subnet_ids         = contains(["createUser", "getUserById", "editUser", "putUserImg", "googleLogin"], each.value.name) ? [] : data.aws_subnets.lambdas_subnets.ids
  vpc_security_group_ids = contains(["createUser", "getUserById", "editUser", "putUserImg", "googleLogin"], each.value.name) ? [] : [module.security_groups.lambda_sg_id]

  environment_variables = {
    RDS_HOST       = module.rds_mysql.proxy_endpoint
    DB_USERNAME    = var.rds_db_username
    DB_PASSWORD    = var.rds_db_password
    DB_NAME        = var.rds_db_name
    S3_BUCKET_NAME = "${var.images_bucket_name}-${random_string.random_suffix.result}"
    USER_POOL_ID   = module.cognito.id
    CLIENT_ID      = module.cognito.client_id
    LAMBDA_SNS_PUBLISHER = values(local.sns_lambda_functions_arn)[0]
  }
}


resource "null_resource" "invoke_db" {
  depends_on = [ module.lambda_functions, module.rds_mysql ]

  provisioner "local-exec" {
    command = "aws lambda invoke --function-name ${module.lambda_functions["setupDB"].function_name} response.json"
  }

  triggers = {
    lambda_source_code = module.lambda_functions["setupDB"].source_code_hash
  }
}

# =============== REST API ===========================

locals {
  lambda_function_arns = {
    for name, lambda in module.lambda_functions : name => lambda.function_arn
  }
}

module "api_gateway" {
  depends_on = [module.lambda_functions, module.cognito]
  source     = "./modules/api-gateway"

  api_name        = var.api_name
  api_description = var.api_description
  stage_name      = var.stage_name

  # Pass the Cognito User Pool ARN for authentication
  cognito_user_pool_arn = module.cognito.arn

  # Pass all Lambda function ARNs
  lambda_function_arns = local.lambda_function_arns
}

resource "aws_lambda_permission" "api_gateway_lambda" {
  for_each = module.lambda_functions

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${module.api_gateway.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_eventbridge_sns_publisher" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.sns_lambda_functions["snsPublisher"].function_name
  principal     = "events.amazonaws.com"
}

# =============== Frontend Build =====================

resource "null_resource" "api-gateway-url" {
  depends_on = [ module.api_gateway ]
  provisioner "local-exec" {
    command = "./set-api-gw.sh ${module.api_gateway.invoke_url}"
  }
  triggers = {
    always_run = "${timestamp()}"
  }
}

resource "null_resource" "client_id" {
  depends_on = [ module.cognito ]
  provisioner "local-exec" {
    command = "./set-client-id.sh ${module.cognito.client_id}"
  }
  triggers = {
    always_run = "${timestamp()}"
  }
}

resource "null_resource" "frontend_build" {
  depends_on = [ null_resource.api-gateway-url, module.s3_frontend, null_resource.client_id ]

  provisioner "local-exec" {
    command = "npm install && npm run build"
    working_dir = local.frontend_directory
  }
  triggers = {
    always_run = "${timestamp()}"
  }
}

resource "aws_s3_object" "file" {
    depends_on = [ null_resource.frontend_build ]

    for_each = fileset(local.build_directory, "**")

    bucket = module.s3_frontend.bucket_id
    key    = each.value
    source = "${local.build_directory}/${each.value}"
    etag   = filemd5("${local.build_directory}/${each.value}")

    content_type = lookup(local.mime_types, concat(regexall("([^\\.]*)$", each.value), [[""]])[0][0], "")
}

