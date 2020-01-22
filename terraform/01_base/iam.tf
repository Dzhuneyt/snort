resource "aws_iam_user" "github" {
  name = "github"
  path = "/github/"

  tags = {
    tag-key = "tag-value"
  }
}
data "aws_iam_policy_document" "github" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "AWS"
      identifiers = [
        aws_iam_user.github.arn
      ]
    }
  }
}
resource "aws_iam_role" "github" {
  name = "github"
  assume_role_policy = data.aws_iam_policy_document.github.json
}

resource "aws_iam_access_key" "this" {
  user = aws_iam_user.github.name
}
