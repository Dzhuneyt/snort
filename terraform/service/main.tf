resource "aws_ecs_task_definition" "service" {
  family = "snort"
  container_definitions = data.template_file.service.rendered
}

resource "aws_ecs_service" "snort" {
  name = "snort"
  cluster = var.cluster_id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count = 2
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent = 200
  //  iam_role = "${aws_iam_role.foo.arn}"

  ordered_placement_strategy {
    type = "spread"
    field = "instanceId"
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
