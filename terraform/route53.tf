resource "aws_route53_zone" "this" {
  name = "snort.cc"
  delegation_set_id = aws_route53_delegation_set.this.id
}

resource "aws_route53_record" "demo" {
  zone_id = aws_route53_zone.this.zone_id
  name = "demo.snort.cc"
  type = "A"

  ttl = "30"
  records = [
    aws_eip.this.public_ip
  ]
}
