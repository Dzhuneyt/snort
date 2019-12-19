data "aws_vpc" "selected" {
  tags = {
    Name = "snort"
  }
}
data "aws_subnet_ids" "this" {
  vpc_id = data.aws_vpc.selected.id
}
data "aws_subnet" "public" {
  count = length(data.aws_subnet_ids.this.ids)
  id    = tolist(data.aws_subnet_ids.this.ids)[count.index]
}
