variable "aws_profile" {
  default = "default"
}
variable "aws_shared_credentials_file" {
  default = "~/.aws/credentials"
}
variable "ssh_key_name" {
  default = ""
}
variable "cluster_id" {
  description = "The cluster where to put the services"
}
variable "ecr_repository_base_url" {
  description = "The base URL where the ECR images are hosted on"
}
variable "docker_tag" {
  description = "The tag which to use to pull ECR images"
}
