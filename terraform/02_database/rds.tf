/* subnet used by rds */
resource "aws_db_subnet_group" "rds_subnet_group" {
  name = "${local.stack_name}-rds-subnet-group"
  description = "RDS subnet group"
  subnet_ids = data.aws_subnet_ids.public.ids
  tags = {
    Environment = local.environment
  }
}

resource "aws_security_group" "rds_sg" {
  name = "${local.stack_name}-rds-sg"
  description = "${local.stack_name} Security Group"
  vpc_id = data.aws_vpc.this.id
  tags = {
    Name = "${local.stack_name}-rds-sg"
    Environment = local.environment
  }


  //allow traffic for TCP 3306
  // @TODO uncomment and activate
  //  ingress {
  //    from_port = 3306
  //    to_port = 3306
  //    protocol = "tcp"
  //    security_groups = [
  //      //      aws_security_group.snort_ec2_instance.id,
  //      module.ecs-cluster.security_group_for_ec2_instances
  //    ]
  //  }

}

resource "aws_security_group_rule" "internal_traffic" {
  from_port = 0
  protocol = "-1"
  self = true
  security_group_id = aws_security_group.rds_sg.id
  to_port = 0
  type = "ingress"
}
// Allow RDS to communicate with internet
resource "aws_security_group_rule" "egress_all" {
  from_port = 0
  protocol = "-1"
  cidr_blocks = [
    "0.0.0.0/0"]
  security_group_id = aws_security_group.rds_sg.id
  to_port = 0
  type = "egress"
}
resource "aws_security_group_rule" "ingress_from_own_vpc" {
  from_port = 0
  protocol = "-1"
  security_group_id = aws_security_group.rds_sg.id
  to_port = 0
  cidr_blocks = [
    data.aws_vpc.this.cidr_block
  ]
  type = "ingress"
}

resource "aws_db_instance" "rds" {
  identifier = "${local.stack_name}-database"

  // Storage space in GB
  allocated_storage = "20"
  engine = "mysql"
  engine_version = "5.7"
  // $12/mo
  instance_class = "db.t3.micro"
  multi_az = false

  // Default database to create on init
  name = local.db_name

  username = "snort"
  // TODO Randomize password
  password = "snort123"
  db_subnet_group_name = aws_db_subnet_group.rds_subnet_group.id
  vpc_security_group_ids = [
    aws_security_group.rds_sg.id
  ]
  skip_final_snapshot = true
  copy_tags_to_snapshot = true
  enabled_cloudwatch_logs_exports = [
    "error",
    "slowquery",
  ]
  tags = {
    Environment = local.environment
  }
}
