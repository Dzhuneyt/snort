data "aws_iam_policy_document" "ecr" {
  statement {
    sid = "AllowDockerCliAuth"
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
    sid = "AllowPushingDockerImages"
  }
}
resource "aws_iam_policy" "ecr" {
  path = "/github/snort/"
  name_prefix = "github_snort_ecr_pusher"
  policy = data.aws_iam_policy_document.ecr.json
}

data "aws_iam_policy_document" "ec2_read_only" {
  statement {
    actions = [
      "ec2:Describe*"
    ]
    resources = [
      "*"
    ]
  }
}
resource "aws_iam_policy" "ec2_read_only" {
  path = "/github/snort/"
  name_prefix = "github_snort_ec2_read_only"
  policy = data.aws_iam_policy_document.ec2_read_only.json
}

data "aws_kms_key" "ssm" {
  key_id = "alias/aws/ssm"
}
data "aws_iam_policy_document" "kms" {
  statement {
    actions = [
      "kms:Decrypt"
    ]
    resources = [
      data.aws_kms_key.ssm.arn
    ]
  }
}
resource "aws_iam_policy" "kms" {
  path = "/github/snort/"
  name_prefix = "github_snort_kms"
  policy = data.aws_iam_policy_document.kms.json
}

# Generic "read only" permissions
data "aws_iam_policy_document" "generic_read_only" {
  statement {
    sid = "AllowListingRDS"
    actions = [
      "rds:Describe*",
    ]
    resources = [
      "*"
    ]
  }
  statement {
    sid = "SSMDescribeAllParameters"
    actions = [
      "ssm:DescribeParameters"]
    resources = [
      "*"]
  }
  statement {
    sid = "ReadTags"
    actions = [
      "ssm:ListTagsForResource",
      "rds:ListTagsForResource",
    ]
    resources = [
      "*"
    ]
  }
  statement {
    sid = "SSMManage"
    actions = [
      "ssm:PutParameter",
      "ssm:DeleteParameter",
      "ssm:GetParameterHistory",
      "ssm:GetParametersByPath",
      "ssm:GetParameters",
      "ssm:GetParameter",
      "ssm:DeleteParameters"
    ]
    resources = [
      "arn:aws:ssm:*:*:parameter/snort-*"
    ]
  }
  statement {
    sid = "StsGetCallerIdentity"
    actions = [
      "sts:GetCallerIdentity"
    ]
    resources = [
      "*"
    ]
  }
}
resource "aws_iam_policy" "generic_read_only" {
  path = "/github/snort/"
  name_prefix = "github_snort_generic"
  policy = data.aws_iam_policy_document.generic_read_only.json
}


// TODO Attach the above policies to the role and remove the Admin policy as attachment
