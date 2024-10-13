output "bucket_name" {
    value = aws_s3_bucket.frontend_bucket.id
}

output "website_url" {
    value = aws_s3_bucket_website_configuration.hosting.website_endpoint
}