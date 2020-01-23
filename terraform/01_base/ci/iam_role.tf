resource "aws_iam_role" "github" {
  name = "github@snort"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
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
