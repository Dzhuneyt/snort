data "aws_iam_policy" "AmazonEC2ContainerRegistryPowerUser" {
  # Allow pushing and pulling from all ECR repos
  arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}
data aws_iam_policy AdministratorAccess {
  # Allow administering all AWS resources
  # USE CAREFULLY
  arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
data aws_iam_policy IAMReadOnlyAccess {
  arn = "arn:aws:iam::aws:policy/IAMReadOnlyAccess"
}
