# 1. Create the SG with no rules to avoid cycle error
resource "aws_security_group" "lambda_sg" {
    name        = var.lambda_sg_name
    description = "Security Group for Lambda functions"
    vpc_id      = var.vpc_id

    tags = {
      Name: var.lambda_sg_name
    }
}

resource "aws_security_group" "rdsproxy_sg" {
    name        = var.rdsproxy_sg_name
    description = "Security Group for RDS Proxy"
    vpc_id      = var.vpc_id

    tags = {
      Name: var.rdsproxy_sg_name
    }
}

resource "aws_security_group" "mysql_sg" {
    name        = var.mysql_sg_name
    description = "Security Group for MySQL"
    vpc_id      = var.vpc_id

    tags = {
      Name: var.mysql_sg_name
    }
}

# 2. Create the rules for the SGs

# Lambda SG outbound to RDS Proxy
resource "aws_security_group_rule" "lambda_to_rdsproxy" { 
  type              = "egress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda_sg.id
  source_security_group_id = aws_security_group.rdsproxy_sg.id
  description       = "Allow outbound traffic from Lambda to RDS Proxy"
}

# RDS Proxy SG inbound from Lambda
resource "aws_security_group_rule" "rdsproxy_from_lambda" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.rdsproxy_sg.id
  source_security_group_id = aws_security_group.lambda_sg.id
  description       = "Allow inbound traffic from Lambda to RDS Proxy"
}

# RDS Proxy SG outbound to MySQL
resource "aws_security_group_rule" "rdsproxy_to_mysql" {
  type              = "egress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.rdsproxy_sg.id
  source_security_group_id = aws_security_group.mysql_sg.id
  description       = "Allow outbound traffic from RDS Proxy to MySQL"
}

# MySQL SG inbound from RDS Proxy
resource "aws_security_group_rule" "mysql_from_rdsproxy" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.mysql_sg.id
  source_security_group_id = aws_security_group.rdsproxy_sg.id
  description       = "Allow inbound traffic from RDS Proxy to MySQL"
}
