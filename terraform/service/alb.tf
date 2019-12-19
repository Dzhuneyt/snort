resource "aws_lb" "test" {
  name = "test-lb-tf"
  internal = false
  load_balancer_type = "application"
  security_groups = [
    aws_security_group.lb_sg.id
  ]
  subnets = data.aws_subnet.public.*.id

  tags = {
    Environment = "production"
  }
}
resource "aws_alb_target_group" "frontend" {
  name = "tf-example-ecs-ghost"
  port = 80
  protocol = "HTTP"
  vpc_id = data.aws_vpc.selected.id
}
resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_lb.test.id
  port = "80"
  protocol = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.frontend.id
    type = "forward"
  }
}
