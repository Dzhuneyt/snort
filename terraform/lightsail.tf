resource "aws_lightsail_instance" "this" {
  name = "snort"
  availability_zone = "us-east-1b"
  blueprint_id = "ubuntu_18_04"
  bundle_id = "micro_2_0"
  key_pair_name = aws_lightsail_key_pair.this.name
  tags = {
    foo = "bar"
  }
}
resource "aws_lightsail_key_pair" "this" {
  name = "Dell-G5"
  public_key = file("~/.ssh/id_rsa.pub")
}
