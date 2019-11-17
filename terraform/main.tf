module "ec2-profile" {
  source = "./ecs-instance-profile"
  name = "snort-instance-profile"
  providers = {
    aws = aws
  }
}

locals {
  name = "complete-ecs"
  environment = "dev"

  # This is the convention we use to know what belongs to each other
  ec2_resources_name = "${local.name}-${local.environment}"
}
module "ecs-cluster" {
  source = "github.com/Dzhuneyt/terraform-module-aws-ecs-cluster?ref=v1.0.6"

  create_vpc = false
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets
  cluster_name = "snort"
  min_spot_instances = 1
  max_spot_instances = 2
  spot_bid_price = "0.0122"
  instance_type_spot = "t3a.small"

  providers = {
    aws = aws
  }
}
