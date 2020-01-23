output "github_role_arn" {
  value = aws_iam_role.github.arn
}
output "github_access_key" {
  value = aws_iam_access_key.this.id
}
output "github_access_secret_key" {
  value = aws_iam_access_key.this.secret
}
