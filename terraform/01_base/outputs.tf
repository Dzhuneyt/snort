output "ecr_backend" {
  value = aws_ecr_repository.backend.repository_url
}
output "ecr_frontend" {
  value = aws_ecr_repository.frontend.repository_url
}
output "ecr_nginx" {
  value = aws_ecr_repository.nginx.repository_url
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
output "public_subnets" {
  value = module.vpc.public_subnets
}
output "private_subnets" {
  value = module.vpc.private_subnets
}
output "github_role_arn" {
  value = aws_iam_role.github.arn
}
output "github_access_key" {
  value = aws_iam_access_key.this.id
}
output "github_access_secret_key" {
  value = aws_iam_access_key.this.secret
}
