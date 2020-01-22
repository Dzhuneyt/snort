// Terraform remote backend
terraform {
  backend "s3" {
    bucket = "terraform-backends-dz"
    // @TODO delete this file physically on S3
    key            = "snort/base-infrastructure.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}
