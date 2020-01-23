provider "aws" {
  region = "us-east-1"
  profile = var.aws_profile
}
provider "aws" {
  alias = "aws_eu_west_1"
  region = "eu-west-1"
  profile = var.aws_profile
}

# Define the CI infrastructure in GitHub
module "ci" {
  source = "./ci"
  providers = {
    "aws" = "aws"
    "aws.aws_eu_west_1" = "aws.aws_eu_west_1"
  }
}
