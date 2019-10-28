resource "aws_security_group" "snort_ec2_instance" {
  name = "EC2 instance of snort"
  vpc_id = data.aws_vpc.selected.id
}
resource "aws_security_group_rule" "ssh_in" {
  from_port = 22
  to_port = 22
  cidr_blocks = [
    "62.73.85.179/32"
  ]
  protocol = "tcp"
  security_group_id = aws_security_group.snort_ec2_instance.id
  type = "ingress"
}
resource "aws_security_group_rule" "egress" {
  from_port = 0
  to_port = 65535
  protocol = "tcp"
  cidr_blocks = [
    "0.0.0.0/0"]
  security_group_id = aws_security_group.snort_ec2_instance.id
  type = "egress"
}
resource "aws_security_group_rule" "ingress_http" {
  from_port = 80
  protocol = "tcp"
  security_group_id = aws_security_group.snort_ec2_instance.id
  to_port = 80
  cidr_blocks = [
    "0.0.0.0/0"]
  type = "ingress"
}
