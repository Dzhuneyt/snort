data "aws_vpc" "this" {
  tags = {
    Name = "snort"
  }
}

data "aws_subnet_ids" "private" {
  vpc_id = data.aws_vpc.this.id
  tags = {
    Private = "true"
  }
}
data "aws_subnet_ids" "public" {
  vpc_id = data.aws_vpc.this.id
  tags = {
    Private = "false"
  }
}
