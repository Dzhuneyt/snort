output "ec2_ip" {
  value = aws_eip.this.public_dns
}
//output "nameservers" {
//  value = aws_route53_delegation_set.this.name_servers
//}
