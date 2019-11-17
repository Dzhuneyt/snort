output "ecr_backend" {
  value = aws_ecr_repository.backend.repository_url
}
output "ecr_frontend" {
  value = aws_ecr_repository.frontend.repository_url
}
