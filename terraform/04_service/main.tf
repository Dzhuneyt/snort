data "aws_ecs_cluster" "this" {
  cluster_name = "snort"
}
resource "aws_ecs_task_definition" "service" {
  family = "snort"
  container_definitions = data.template_file.service.rendered
}
resource "aws_ecs_service" "snort" {
  name = "snort"
  cluster = data.aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count = 2
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent = 200
  //  iam_role = "${aws_iam_role.foo.arn}"

  ordered_placement_strategy {
    type = "spread"
    field = "instanceId"
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.frontend.id
    container_name = "nginx"
    container_port = "80"
  }
}
