resource "aws_cloudwatch_log_group" "snort" {
  name = "snort"

  tags = {
    Environment = "production"
    Application = "serviceA"
  }
  retention_in_days = 7
}
data "aws_region" "current" {}

data "template_file" "service" {
  template = file("${path.module}/task-definitions/service.json")

  vars = {
    ecr_repository_base_url = var.ecr_repository_base_url
    log_group = aws_cloudwatch_log_group.snort.name
    log_region = data.aws_region.current.name
  }
}
resource "aws_ecs_task_definition" "service" {
  family = "snort"
  container_definitions = data.template_file.service.rendered
}

resource "aws_ecs_service" "snort" {
  name = "snort"
  cluster = var.cluster_id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count = 3
  //  iam_role = "${aws_iam_role.foo.arn}"

  ordered_placement_strategy {
    type = "binpack"
    field = "cpu"
  }
  //
  //  load_balancer {
  //    target_group_arn = "${aws_lb_target_group.foo.arn}"
  //    container_name = "mongo"
  //    container_port = 8080
  //  }

  //  placement_constraints {
  //    type = "memberOf"
  //    expression = "attribute:ecs.availability-zone in [us-west-2a, us-west-2b]"
  //  }
}
