output "ec2_ip" {
  value = aws_eip.this.public_dns
}
