resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "mysql_rds" {

    engine                  = "mysql"
    engine_version          = var.engine_version

    multi_az                = var.multi_az

    identifier              = var.db_identifier
    username                = var.username
    password                = var.password

    instance_class          = var.instance_class

    storage_type            = "gp3"
    allocated_storage       = var.allocated_storage

    db_subnet_group_name    = aws_db_subnet_group.rds_subnet_group.name
    publicly_accessible     = false
    
    vpc_security_group_ids  = var.vpc_security_group_ids

    db_name                 = var.db_name
    port                    = "3306"

    storage_encrypted       = true

    backup_retention_period = 1
}