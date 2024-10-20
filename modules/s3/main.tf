resource "aws_s3_bucket" "bucket" {
    force_destroy = true
    bucket = var.bucket_name

    tags = {
        Name = var.bucket_name
    }
}

resource "aws_s3_bucket_public_access_block" "bucket_access_block" {
    bucket = aws_s3_bucket.bucket.id

    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
}


# ==================================== S3 Bucket Website Configuration ====================================

resource "aws_s3_bucket_website_configuration" "hosting" {
    count  = var.is_website ? 1 : 0
    bucket = aws_s3_bucket.bucket.id
    
    index_document {
        suffix = local.index_document
    }

      error_document {
        key = local.error_document
    }
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
    count  = var.is_website ? 1 : 0
    bucket = aws_s3_bucket.bucket.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
        {
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action = "s3:GetObject"
            "Resource" : "arn:aws:s3:::${aws_s3_bucket.bucket.id}/*"
        }
        ]
    })
}

# ==================================== S3 Bucket For Images Configuration ====================================

resource "aws_s3_bucket_ownership_controls" "images_bucket_ownership" {
    count  = !var.is_website ? 1 : 0

    bucket = aws_s3_bucket.bucket.id
  
    rule {
        object_ownership = "BucketOwnerPreferred"
    }
}


resource "aws_s3_bucket_acl" "images_bucket_acl" {
    count  = !var.is_website ? 1 : 0

    depends_on = [aws_s3_bucket_ownership_controls.images_bucket_ownership]

    bucket = aws_s3_bucket.bucket.id
    acl    = "public-read"
}

