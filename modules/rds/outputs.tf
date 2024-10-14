output "rds_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.mysql_rds.endpoint
}


output "proxy_endpoint" {
  description = "Endpoint for the RDS Proxy"
  value       = aws_db_proxy.rds_proxy.endpoint
}