resource "aws_iam_user" "github" {
  name = "github@snort"
  path = "/github/"
}
resource "aws_iam_access_key" "this" {
  user = aws_iam_user.github.name
}

