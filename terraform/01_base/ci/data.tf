data aws_s3_bucket terraform_backend {
  bucket   = "terraform-backends-dz"
  provider = aws.aws_eu_west_1
}
data aws_dynamodb_table terraform_state_lock {
  name     = "terraform-lock"
  provider = aws.aws_eu_west_1
}
