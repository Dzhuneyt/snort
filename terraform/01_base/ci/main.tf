resource "aws_iam_role_policy_attachment" "attachment1" {
  policy_arn = aws_iam_policy.generic_read_only.arn
  role = aws_iam_role.github.name
}
resource "aws_iam_role_policy_attachment" "attachment2" {
  policy_arn = aws_iam_policy.ecr.arn
  role = aws_iam_role.github.name
}
resource "aws_iam_role_policy_attachment" "attachment3" {
  policy_arn = aws_iam_policy.ec2_read_only.arn
  role = aws_iam_role.github.name
}
resource "aws_iam_role_policy_attachment" "attachment4" {
  policy_arn = aws_iam_policy.kms.arn
  role = aws_iam_role.github.name
}
resource "aws_iam_role_policy_attachment" "attachment5" {
  policy_arn = aws_iam_policy.terraform_backend_manager.arn
  role = aws_iam_role.github.name
}
resource "aws_iam_role_policy_attachment" "attachment6" {
  policy_arn = aws_iam_policy.ecs_cluster_manager.arn
  role = aws_iam_role.github.name
}
resource "aws_iam_role_policy_attachment" "attachment7" {
  policy_arn = data.aws_iam_policy.IAMReadOnlyAccess.arn
  role = aws_iam_role.github.name
}

//resource "aws_iam_role_policy_attachment" "role_attach_admin_policy" {
//  policy_arn = data.aws_iam_policy.AdministratorAccess.arn
//  role = aws_iam_role.github.name
//}
