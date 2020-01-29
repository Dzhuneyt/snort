remote_state {
  backend = "s3"
  config = {
    bucket = "terraform-backends-dz"

    //key = "snort/${path_relative_to_include()}.tfstate"
    key = "snort/${local.env}/${path_relative_to_include()}.tfstate"
    region = "eu-west-1"
    encrypt = true
    dynamodb_table = "terraform-lock"
  }
}
locals {
  env = "master"
}
