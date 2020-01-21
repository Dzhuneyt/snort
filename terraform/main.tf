module "ecs-cluster" {
  source = "github.com/Dzhuneyt/terraform-module-aws-ecs-cluster?ref=v2.0.0"

  // Reuse VPC
  create_vpc = false
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets

  cluster_name = "snort"
  min_spot_instances = 2
  max_spot_instances = 5
  spot_bid_price = "0.0122"
  instance_type_spot = "t3a.small"

  providers = {
    aws = aws
  }
}
