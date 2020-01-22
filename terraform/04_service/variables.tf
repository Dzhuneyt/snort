variable "aws_profile" {
  default = "default"
}
variable "aws_shared_credentials_file" {
  default = "~/.aws/credentials"
}
variable "ssh_key_name" {
  default = ""
}
variable "ecr_repository_base_url" {
  description = "The base URL where the ECR images are hosted on"
  default = "216987438199.dkr.ecr.us-east-1.amazonaws.com/snort"
}
variable "docker_tag" {
  description = "The tag which to use to pull ECR images"
}
