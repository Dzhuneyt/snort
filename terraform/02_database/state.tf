// Terraform remote backend
terraform {
  backend "s3" {
    bucket         = "terraform-backends-dz"
    key            = "snort/02_database.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}

