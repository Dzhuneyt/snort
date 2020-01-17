# TODO use these variables instead of hardcoded values throughout the stack
locals {
  name = "snort"
  environment = "dev"

  # This is the convention we use to know what belongs to each other
  stack_name = "${local.name}-${local.environment}"
}
