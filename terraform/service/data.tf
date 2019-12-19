data "aws_region" "current" {}

data "template_file" "service" {
  template = file("${path.module}/task-definitions/service.json")

  vars = {
    ecr_repository_base_url = var.ecr_repository_base_url
    log_group = aws_cloudwatch_log_group.snort.name
    log_region = data.aws_region.current.name
    TAG = var.docker_tag
    DB_HOST = var.DB_HOST
    DB_DATABASE = var.DB_DATABASE
    DB_USERNAME = var.DB_USERNAME
    DB_PASSWORD = var.DB_PASSWORD
  }
}
