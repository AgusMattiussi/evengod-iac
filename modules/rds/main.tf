resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "mysql_rds" {
  engine                  = var.engine
  engine_version          = var.engine_version

  multi_az                = var.multi_az

  identifier              = var.db_identifier
  username                = var.username
  password                = var.password

  instance_class          = var.instance_class

  storage_type            = var.storage_type
  allocated_storage       = var.allocated_storage

  db_subnet_group_name    = aws_db_subnet_group.rds_subnet_group.name
  publicly_accessible     = false
    
  vpc_security_group_ids  = var.vpc_security_group_ids

  db_name                 = var.db_name
  port                    = var.port

  storage_encrypted       = true

  backup_retention_period = var.backup_retention_period

  skip_final_snapshot     = true
}

# ================= RDS Proxy =================
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.name}-credentials"

  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.username
    password = var.password
  })
}

data "aws_caller_identity" "current" {}

resource "aws_db_proxy" "rds_proxy" {
  name                   = "${var.name}-proxy"
  debug_logging          = false
  engine_family          = "MYSQL"
  idle_client_timeout    = 5
  require_tls            = false
  role_arn               = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  vpc_security_group_ids = var.rds_proxy_sg
  vpc_subnet_ids         = var.subnet_ids

  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.db_credentials.arn
  }
}

resource "aws_db_proxy_default_target_group" "rds_proxy_target_group" {
  db_proxy_name = aws_db_proxy.rds_proxy.name

  connection_pool_config {
    max_connections_percent = 100
  }
}

resource "aws_db_proxy_target" "default" {
  db_instance_identifier = aws_db_instance.mysql_rds.identifier
  db_proxy_name          = aws_db_proxy.rds_proxy.name
  target_group_name      = aws_db_proxy_default_target_group.rds_proxy_target_group.name
}
