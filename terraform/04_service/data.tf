data "aws_region" "current" {}

data "template_file" "service" {
  template = file("${path.module}/service.json")

  vars = {
    ecr_repository_base_url = var.ecr_repository_base_url
    log_group               = aws_cloudwatch_log_group.snort.name
    log_region              = data.aws_region.current.name
    TAG                     = var.docker_tag
    // @TODO inject those from AWS Systems Manager
    // @TODO see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data.html
    DB_HOST     = var.DB_HOST
    DB_DATABASE = var.DB_DATABASE
    DB_USERNAME = var.DB_USERNAME
    DB_PASSWORD = var.DB_PASSWORD
  }
}
