provider "aws" {
  region  = "us-east-1"
  profile = var.aws_profile
}

# Define the CI infrastructure in GitHub
module "ci" {
  source = "./ci"
  providers = {
    aws = aws
  }
}
