variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
}

variable "is_website" {
  description = "Whether to configure the bucket for website hosting"
  type        = bool
}