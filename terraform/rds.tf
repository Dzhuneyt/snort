/* subnet used by rds */
resource "aws_db_subnet_group" "rds_subnet_group" {
  name = "${local.stack_name}-rds-subnet-group"
  description = "RDS subnet group"
  subnet_ids = module.vpc.private_subnets
  tags = {
    Environment = local.environment
  }
}

resource "aws_security_group" "rds_sg" {
  name = "${local.stack_name}-rds-sg"
  description = "${local.stack_name} Security Group"
  vpc_id = module.vpc.vpc_id
  tags = {
    Name = "${local.stack_name}-rds-sg"
    Environment = local.environment
  }

  // allows traffic from the SG itself
  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    self = true
  }

  //allow traffic for TCP 5432
  ingress {
    from_port = 3306
    to_port = 3306
    protocol = "tcp"
    security_groups = [
      //      aws_security_group.snort_ec2_instance.id,
      module.ecs-cluster.security_group_for_ec2_instances
    ]
  }

  // outbound internet access
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [
      "0.0.0.0/0"]
  }
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
  name = "snort"

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
