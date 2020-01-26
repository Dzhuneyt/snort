resource "aws_ecr_repository" "backend" {
  name                 = "snort/backend"
  image_tag_mutability = "MUTABLE"
  tags = {
    Name = local.name
    Env  = local.environment
  }
}
resource "aws_ecr_repository" "frontend" {
  name                 = "snort/frontend"
  image_tag_mutability = "MUTABLE"
  tags = {
    Name = local.name
    Env  = local.environment
  }
}
resource "aws_ecr_repository" "nginx" {
  name                 = "snort/nginx"
  image_tag_mutability = "MUTABLE"
  tags = {
    Name = local.name
    Env  = local.environment
  }
}

locals {
  snort_repos = [
    aws_ecr_repository.nginx.name,
    aws_ecr_repository.frontend.name,
    aws_ecr_repository.backend.name,
  ]
}

resource "aws_ecr_lifecycle_policy" "ecr_expire_policy" {
  count      = length(local.snort_repos)
  repository = local.snort_repos[count.index]

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 2,
            "description": "Keep only one untagged image, expire all others",
            "selection": {
                "tagStatus": "untagged",
                "countType": "imageCountMoreThan",
                "countNumber": 1
            },
            "action": {
                "type": "expire"
            }
        },
        {
            "rulePriority": 999,
            "description": "Keep last 30 images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 30
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}
