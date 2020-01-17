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

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "sg_of_ec2_instances" {
  value = module.ecs-cluster.security_group_for_ec2_instances
}
output "rds_host" {
  value = aws_db_instance.rds.endpoint
}
