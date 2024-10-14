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

# ================= Lambda SG Rules =================
resource "aws_security_group_rule" "s3gateway_to_lambda" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda_sg.id
  prefix_list_ids = [ "pl-63a5400a" ]
  description       = "Allow inbound traffic from S3 Gateway to Lambda"
}

resource "aws_security_group_rule" "lambda_to_rdsproxy" { 
  type              = "egress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda_sg.id
  source_security_group_id = aws_security_group.rdsproxy_sg.id
  description       = "Allow outbound traffic from Lambda to RDS Proxy"
}

resource "aws_security_group_rule" "lambda_to_s3gateway" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda_sg.id
  prefix_list_ids = [ "pl-63a5400a" ]
  description       = "Allow outbound traffic from Lambda to S3 Gateway"
}

# ================= RDS Proxy SG Rules =================
resource "aws_security_group_rule" "rdsproxy_from_lambda" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.rdsproxy_sg.id
  source_security_group_id = aws_security_group.lambda_sg.id
  description       = "Allow inbound traffic from Lambda to RDS Proxy"
}

resource "aws_security_group_rule" "rdsproxy_to_mysql" {
  type              = "egress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.rdsproxy_sg.id
  source_security_group_id = aws_security_group.mysql_sg.id
  description       = "Allow outbound traffic from RDS Proxy to MySQL"
}

# ================= MySQL SG Rules =================
resource "aws_security_group_rule" "mysql_from_rdsproxy" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.mysql_sg.id
  source_security_group_id = aws_security_group.rdsproxy_sg.id
  description       = "Allow inbound traffic from RDS Proxy to MySQL"
}
