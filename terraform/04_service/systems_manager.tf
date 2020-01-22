data "aws_ssm_parameter" "db_host" {
  name = "/${local.stack_name}/db/host"
}
data "aws_ssm_parameter" "db_database" {
  name = "/${local.stack_name}/db/database"
}
data "aws_ssm_parameter" "db_port" {
  name = "/${local.stack_name}/db/port"
}
data "aws_ssm_parameter" "db_user" {
  name = "/${local.stack_name}/db/user"
}
data "aws_ssm_parameter" "db_password" {
  name = "/${local.stack_name}/db/password"
}
