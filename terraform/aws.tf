provider "aws" {
  version = "~> 2.0"
  region = "us-east-1"

  shared_credentials_file = var.aws_shared_credentials_file
  profile = var.aws_profile
}
