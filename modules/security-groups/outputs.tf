
output "lambda_sg_id" {
  value = aws_security_group.lambda_sg.id
}

output "rdsproxy_sg_id" {
  value = aws_security_group.rdsproxy_sg.id
}

output "mysql_sg_id" {
  value = aws_security_group.mysql_sg.id
}