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

# ================= VPC Endpoint SNS SG Rules =================
resource "aws_security_group" "sns_endpoint_sg" {
  name        = var.sns_endpoint_sg_name
  description = "Security Group for SNS VPC Endpoint"
  vpc_id      = var.vpc_id

  tags = {
    Name = var.sns_endpoint_sg_name
  }
}

# ======== Event Bridge VPC Endpoint SG ========
resource "aws_security_group" "events_endpoint_sg" {
  name        = var.events_endpoint_sg_name
  description = "Security Group for EventBridge VPC Endpoint"
  vpc_id      = var.vpc_id

  tags = {
    Name = var.events_endpoint_sg_name
  }
}


###################### Security Groups Rules ######################

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

resource "aws_security_group_rule" "lambda_to_sns_endpoint" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda_sg.id
  source_security_group_id = aws_security_group.sns_endpoint_sg.id  # Cambiar a esto
  description       = "Allow outbound HTTPS traffic from Lambda to SNS Endpoint"
}

resource "aws_security_group_rule" "lambda_to_events" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow outbound HTTPS traffic from Lambda to EventBridge"
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

# ================= SNS Endpoint SG Rules =================
resource "aws_security_group_rule" "sns_endpoint_from_lambda" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.sns_endpoint_sg.id
  source_security_group_id = aws_security_group.lambda_sg.id
  description       = "Allow inbound HTTPS traffic from Lambda to SNS Endpoint"
}

resource "aws_security_group_rule" "sns_endpoint_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.sns_endpoint_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all outbound traffic from SNS endpoint"
}

# ================= Event Bridge Endpoint SG Rules =================
resource "aws_security_group_rule" "events_endpoint_from_lambda" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.events_endpoint_sg.id
  source_security_group_id = aws_security_group.lambda_sg.id
  description       = "Allow inbound HTTPS traffic from Lambda to EventBridge Endpoint"
}

resource "aws_security_group_rule" "lambda_to_events_endpoint" {
  type                     = "egress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.lambda_sg.id
  source_security_group_id = aws_security_group.events_endpoint_sg.id
  description             = "Allow outbound HTTPS traffic from Lambda to EventBridge endpoint"
}

resource "aws_security_group_rule" "events_endpoint_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.events_endpoint_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all outbound traffic from EventBridge endpoint"
}