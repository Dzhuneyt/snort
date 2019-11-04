locals {
  allocation_id = aws_eip.this.allocation_id
}
resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnets[0]
  ami = data.aws_ami.ubuntu.id
  instance_type = "t3a.small"
  vpc_security_group_ids = [
    aws_security_group.snort_ec2_instance.id,
  ]
  key_name = var.ssh_key_name
  user_data = <<-EOF
#! /bin/bash

SSH_USER=ubuntu

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    git curl \
    gnupg-agent \
    software-properties-common

##
## Setup SSH Config
##
touch /home/$SSH_USER/.ssh/config
#cat <<"__EOF__" > /home/$SSH_USER/.ssh/config
#Host *
#    StrictHostKeyChecking no
#__EOF__
#chmod 600 /home/$SSH_USER/.ssh/config
#chown $SSH_USER:$SSH_USER /home/$SSH_USER/.ssh/config

echo Cloning Snort
git clone --verbose https://github.com/Dzhuneyt/snort.git /app

echo NGINX_PORT=80 >> /app/.env
echo BUILD_ENV=production >> /app/.env

echo Installing Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

echo Installing Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

cd /app && docker-compose up -d

# Associate elastic IP with this instance
#INSTANCE_ID=`/usr/bin/curl -s http://169.254.169.254/latest/meta-data/instance-id`
#aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id ${local.allocation_id} --allow-reassociation

EOF

  tags = {
    Name = "snort"
  }
  depends_on = [
    aws_eip.this
  ]
}
data "aws_vpc" "selected" {
  id = module.vpc.vpc_id
}
