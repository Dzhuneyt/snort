resource "aws_ecr_repository" "backend" {
  name = "snort/backend"
  image_tag_mutability = "MUTABLE"
}
resource "aws_ecr_repository" "frontend" {
  name = "snort/frontend"
  image_tag_mutability = "MUTABLE"
}
