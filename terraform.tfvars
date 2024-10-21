vpc_name             = "evengod-vpc"
cidr_block           = "10.0.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]

# Cambiar segun cada cuenta
images_bucket_name   = "evengod-images"
frontend_bucket_name = "evengod-frontend"

lambda_sg_name    = "lambda-sg"
rds_proxy_sg_name = "rdsproxy-sg"
my_sql_sg_name    = "mysql-sg"

rds_db_identifier = "evengod-db"
rds_db_name       = "evengoddb"

# Entendemos que estas credenciales no corresponde que sean pusheadas pero las agregamos al archivo .tfvars para simplificar el deploy
rds_db_username = "admin"
rds_db_password = "admin123"

vpc_endpoint_s3_name = "s3-images-vpc-endpoint"

# cognito
cognito_domain          = "evengod"
user_pool_name          = "evengod-user-pool"
google_client_id        = "102897822622-j0m36vpo56fqetqb0sbf2k9rtv6tp9m7.apps.googleusercontent.com"
google_client_secret    = "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"

# API GW
api_name = "evengod-rest-api"
api_description = "REST API for evengod services"
stage_name = "prod"

# lambdas
lambda_functions = [
  {
    name       = "getCategories"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "categories/getCategories"
  },
  {
    name       = "getCategoryById"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "categories/getCategoryById"
  },
  {
    name       = "createEvent"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "events/createEvent"
  },
  {
    name       = "editEvent"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "events/editEvent"
  },
  {
    name       = "getEventById"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "events/getEventById"
  },
  {
    name       = "getEventImg"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "events/getEventImg"
  },
  {
    name       = "getEvents"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "events/getEvents"
  },
  {
    name       = "putEventImg"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "events/putEventImg"
  },
  {
    name       = "createInscription"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "inscriptions/createInscription"
  },
  {
    name       = "editInscription"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "inscriptions/editInscription"
  },
  {
    name       = "getInscriptionById"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "inscriptions/getInscriptionById"
  },
  {
    name       = "getInscriptions"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "inscriptions/getInscriptions"
  },
  {
    name       = "createUser"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/createUser"
  },
  {
    name       = "deleteUser"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/deleteUser"
  },
  {
    name       = "editUser"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/editUser"
  },
  {
    name       = "getEventsByUserId"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/getEventsByUserId"
  },
  {
    name       = "getUserById"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/getUserById"
  },
  {
    name       = "getUserImg"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/getUserImg"
  },
  {
    name       = "putUserImg"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "users/putUserImg"
  },
  {
    name       = "setupDB"
    handler    = "index.handler"
    runtime    = "nodejs20.x"
    source_dir = "db/"
  }
]

