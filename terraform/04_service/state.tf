// Terraform remote backend
terraform {
  backend "s3" {
    bucket         = "terraform-backends-dz"
    key            = "snort/04_service.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}
