data aws_vpc rds {
  id = "vpc-24d08740"
}
resource "aws_vpc_peering_connection" "foo" {
  # RDS VPC
  peer_vpc_id = data.aws_vpc.rds.id
  vpc_id = data.aws_vpc.selected.id
  auto_accept = true

  tags = {
    Name = "VPC Peering between snort and RDS"
  }

  accepter {
    allow_remote_vpc_dns_resolution = true
  }

  requester {
    allow_remote_vpc_dns_resolution = true
  }
}

data aws_route_tables snort {
  vpc_id = data.aws_vpc.selected.id
}
resource "aws_route" "this" {
  count = length(data.aws_route_tables.snort.ids)
  route_table_id = sort(data.aws_route_tables.snort.ids)[count.index]
  destination_cidr_block = data.aws_vpc.rds.cidr_block
  vpc_peering_connection_id = aws_vpc_peering_connection.foo.id
}
