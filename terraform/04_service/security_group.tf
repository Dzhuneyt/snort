resource "aws_security_group" "lb_sg" {
  description = "SG for ALB of Snort"

  vpc_id = data.aws_vpc.selected.id
  name   = "snort-alb"

  ingress {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidr_blocks = [
    "0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }
}

data "aws_security_group" "snort" {
  tags = {
    Name = "snort"
  }
}

# Allow access from ALB to ECS
resource "aws_security_group_rule" "allow_all" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "tcp"
  security_group_id        = data.aws_security_group.snort.id
  source_security_group_id = aws_security_group.lb_sg.id
}
