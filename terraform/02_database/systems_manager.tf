// Store RDS credentials in AWS's Systems Manager service
// to be retrieved later by the ECS agent and passed down to Docker containers

resource "aws_ssm_parameter" "db_host" {
  name        = "/${local.stack_name}/db/host"
  description = "The parameter description"
  type        = "SecureString"
  value       = aws_db_instance.rds.address

  tags = {
    environment = local.stack_name
  }
}
resource "aws_ssm_parameter" "db_port" {
  name        = "/${local.stack_name}/db/port"
  description = "The parameter description"
  type        = "SecureString"
  value       = aws_db_instance.rds.port

  tags = {
    environment = local.stack_name
  }
}
resource "aws_ssm_parameter" "db_user" {
  name        = "/${local.stack_name}/db/user"
  description = "The parameter description"
  type        = "SecureString"
  value       = aws_db_instance.rds.username

  tags = {
    environment = local.stack_name
  }
}
resource "aws_ssm_parameter" "db_password" {
  name        = "/${local.stack_name}/db/password"
  description = "The parameter description"
  type        = "SecureString"
  value       = aws_db_instance.rds.password

  tags = {
    environment = local.stack_name
  }
}
