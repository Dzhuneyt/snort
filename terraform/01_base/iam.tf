resource "aws_iam_user" "github" {
  name = "github"
  path = "/github/"

  tags = {
    tag-key = "tag-value"
  }
}
data "aws_iam_policy_document" "assume_role_policy" {
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
data "aws_iam_policy_document" "inline_policy" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = [
      "*"
    ]
  }
}
resource "aws_iam_role_policy" "this" {
  policy = data.aws_iam_policy_document.inline_policy.json
  role = aws_iam_role.github.id
}
resource "aws_iam_role" "github" {
  name = "github"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_iam_access_key" "this" {
  user = aws_iam_user.github.name
}
