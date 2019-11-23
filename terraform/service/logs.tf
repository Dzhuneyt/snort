resource "aws_cloudwatch_log_group" "snort" {
  name = "snort"

  tags = {
    Environment = "production"
    Application = "snort"
  }
  retention_in_days = 7
}
