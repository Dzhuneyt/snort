output "ecr_backend" {
  value = aws_ecr_repository.backend.repository_url
}
output "ecr_frontend" {
  value = aws_ecr_repository.frontend.repository_url
}
output "ecr_nginx" {
  value = aws_ecr_repository.nginx.repository_url
}

output "cluster_id" {
  value = module.ecs-cluster.cluster_id
}
