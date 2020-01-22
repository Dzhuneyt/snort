# TODO use these variables instead of hardcoded values throughout the stack
locals {
  name = "snort"
  environment = "dev"

  # This is the convention we use to know what belongs to each other
  stack_name = "${local.name}-${local.environment}"

  db_host = data.aws_ssm_parameter.db_host.value
  db_database = data.aws_ssm_parameter.db_database.value
  db_port = data.aws_ssm_parameter.db_port.value
  db_user = data.aws_ssm_parameter.db_user.value
  db_password = data.aws_ssm_parameter.db_password.value
}
