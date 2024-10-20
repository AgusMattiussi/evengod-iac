locals {
  lambdas_dir = "${path.module}/resources/lambdas"

  frontend_directory = "./resources/frontend"

  build_directory = "./resources/frontend/build"

  mime_types = {
      "html" = "text/html",
      "css"  = "text/css",
      "js"   = "text/javascript",
      "json" = "application/json",
      "png"  = "image/png",
      "jpg"  = "image/jpeg",
      "jpeg" = "image/jpeg",
      "ico"  = "image/vnd.microsoft.icon",
      "txt"  = "text/plain",
  }
}