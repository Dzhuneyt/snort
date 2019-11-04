resource "aws_eip" "this" {
  instance = aws_instance.web.id
  vpc = true
}
