provider "aws" {
  region  = "us-east-1"
  profile = var.aws_profile
}

module "ecs-cluster" {
  source = "github.com/Dzhuneyt/terraform-module-aws-ecs-cluster?ref=v2.0.0"

  // Reuse VPC
  create_vpc = false
  vpc_id     = data.aws_vpc.this.id
  subnet_ids = data.aws_subnet_ids.public.ids

  cluster_name       = "snort"
  min_spot_instances = 2
  max_spot_instances = 5
  spot_bid_price     = "0.0122"
  instance_type_spot = "t3a.small"

  providers = {
    aws = aws
  }
}
