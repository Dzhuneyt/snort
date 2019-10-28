data "aws_availability_zones" "available" {
  state = "available"
}
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "snort"
  cidr = "10.0.0.0/16"

  azs = data.aws_availability_zones.available.names
  private_subnets = []
  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24",
    "10.0.103.0/24"]
  default_vpc_enable_dns_hostnames = true
  default_vpc_enable_dns_support = true

  enable_nat_gateway = false
  enable_vpn_gateway = false

  tags = {
    Terraform = "true"
    Environment = "dev"
  }
}
