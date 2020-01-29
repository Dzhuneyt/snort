// Terraform remote backend
terraform {
  backend "s3" {
    # remote state configured in terragrunt.hcl
    //    bucket = "terraform-backends-dz"
    //    key = "snort/01_base.tfstate"
    //    region = "eu-west-1"
    //    dynamodb_table = "terraform-lock"
  }
}
