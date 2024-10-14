output "rds_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.mysql_rds.endpoint
}

# output "rds_proxy_endpoint" {
#   description = "RDS Proxy endpoint"
#   value       = aws_db_proxy.rds_proxy.endpoint
# }