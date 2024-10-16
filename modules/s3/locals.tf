locals {
    frontend_directory = "./resources/frontend"
    build_directory = "./resources/frontend/build"
    
    mime_types = {
        "html" = "text/html",
        "css"  = "text/css",
        "ico"  = "image/x-icon",
        "js"   = "application/javascript",
        "json" = "application/json",
        "png"  = "image/png",
        "jpg"  = "image/jpeg",
        "jpeg" = "image/jpeg",
  }
}