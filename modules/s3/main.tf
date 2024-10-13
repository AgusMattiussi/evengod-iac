# ========================= S3 Frontend Bucket =========================
resource "aws_s3_bucket" "frontend_bucket" {
    force_destroy = true
    bucket = var.bucket_name

    tags = {
        Name = var.bucket_name
    }
}


resource "aws_s3_bucket_website_configuration" "hosting" {
    bucket = aws_s3_bucket.frontend_bucket.id
    
    index_document {
        suffix = "index.html"
    }

      error_document {
        key = "error.html"
    }
}

resource "aws_s3_bucket_public_access_block" "bucket_access_block" {
    bucket = aws_s3_bucket.frontend_bucket.id

    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
}


resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
    bucket = aws_s3_bucket.frontend_bucket.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
        {
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action = "s3:GetObject"
            "Resource" : "arn:aws:s3:::${aws_s3_bucket.frontend_bucket.id}/*"
        }
        ]
    })
}

# TODO: Upload the content of the website to the S3 bucket
# resource "aws_s3_object" "file" {
#   for_each     = fileset(path.module, "content/**/*.{html,css,js}")
#   bucket       = aws_s3_bucket.bucket.id
#   key          = replace(each.value, "/^content//", "")
#   source       = each.value
#   content_type = lookup(local.content_types, regex("\\.[^.]+$", each.value), null)
#   source_hash  = filemd5(each.value)
# }