resource "aws_iam_user" "github" {
  name = "github@snort"
  path = "/github/"
}

// Define who can assume the role, where this policy is attached
data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "AWS"
      identifiers = [
        aws_iam_user.github.unique_id
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
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:GetLifecyclePolicy",
      "ecr:GetLifecyclePolicyPreview",
      "ecr:ListTagsForResource",
      "ecr:DescribeImageScanFindings",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = [
      "arn:aws:ecr:*:*:repository/snort/*"
    ]
  }
}
resource "aws_iam_role_policy" "this" {
  policy = data.aws_iam_policy_document.inline_policy.json
  role   = aws_iam_role.github.id
}
resource "aws_iam_role" "github" {
  name               = "github@snort"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json

}

resource "aws_iam_access_key" "this" {
  user = aws_iam_user.github.name
}
