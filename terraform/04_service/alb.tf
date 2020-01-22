resource "aws_lb" "this" {
  name               = "snort"
  internal           = false
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
  name     = "snort"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.selected.id
  depends_on = [
    aws_lb.this
  ]
}
resource "aws_alb_listener" "frontend" {
  load_balancer_arn = aws_lb.this.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.frontend.id
    type             = "forward"
  }
}
