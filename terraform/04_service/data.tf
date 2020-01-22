data "aws_region" "current" {}

data "template_file" "service" {
  template = file("${path.module}/service.json")

  vars = {
    ecr_repository_base_url = var.ecr_repository_base_url
    log_group = aws_cloudwatch_log_group.snort.name
    log_region = data.aws_region.current.name
    TAG = var.docker_tag
    // @TODO inject those from AWS Systems Manager
    // @TODO see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data.html
    DB_HOST = local.db_host
    DB_DATABASE = local.db_database
    DB_USERNAME = local.db_user
    DB_PASSWORD = local.db_password
  }
}
