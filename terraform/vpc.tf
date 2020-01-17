data "aws_availability_zones" "available" {
  state = "available"
}
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "snort"
  cidr = "10.0.0.0/16"

  azs = data.aws_availability_zones.available.names
  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24",
    "10.0.103.0/24"]
  private_subnets = [
    // 2+ private subnets required for creation of the "aws_db_subnet_group" resource
    // Otherwise, AWS throws an error:
    // "DB Subnet Group doesn't meet availability zone coverage requirement.
    // Please add subnets to cover at least 2 availability zones. Current coverage: 1"
    "10.0.201.0/24",
    "10.0.202.0/24",
    "10.0.203.0/24",
  ]
  enable_dns_hostnames = true
  enable_dns_support = true

  enable_nat_gateway = false
  enable_vpn_gateway = false

  tags = {
    Terraform = "true"
    Environment = "dev"
    Name = "snort"
  }

  private_subnet_tags = {
    Private = "true"
  }
  public_subnet_tags = {
    Private = "false"
  }
}
