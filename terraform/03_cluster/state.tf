// Terraform remote backend
terraform {
  backend "s3" {
    bucket         = "terraform-backends-dz"
    key            = "snort/03_cluster.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}
