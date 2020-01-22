data "aws_vpc" "selected" {
  tags = {
    Name = "snort"
  }
}
data "aws_subnet_ids" "private" {
  vpc_id = data.aws_vpc.selected.id
  tags = {
    Private = "true"
  }
}
data "aws_subnet_ids" "public" {
  vpc_id = data.aws_vpc.selected.id
  tags = {
    Private = "false"
  }
}
data "aws_subnet" "public" {
  count = length(data.aws_subnet_ids.public.ids)
  id    = tolist(data.aws_subnet_ids.public.ids)[count.index]
}
