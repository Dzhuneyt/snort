data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name = "name"
    values = [
      "ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*"]
  }

  filter {
    name = "virtualization-type"
    values = [
      "hvm"]
  }

  owners = [
    "099720109477"]
  # Canonical
}

resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnets[0]
  ami = data.aws_ami.ubuntu.id
  instance_type = "t3a.small"
  vpc_security_group_ids = [
    aws_security_group.snort_ec2_instance.id,
  ]
  key_name = "Dell G5 Ubuntu"
  user_data = <<EOF
#! /bin/bash

if [ "$(. /etc/os-release; echo $NAME)" = "Ubuntu" ]; then
  apt-get update
  SSH_USER=ubuntu
else
  SSH_USER=ec2-user
fi

sudo apt-get update
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
chmod 600 /home/$SSH_USER/.ssh/config
chown $SSH_USER:$SSH_USER /home/$SSH_USER/.ssh/config

echo Cloning Snort
git clone --verbose https://github.com/Dzhuneyt/snort.git /app

echo NGINX_PORT=80 >> /app/.env
echo BUILD_ENV=production >> /app/.env
ls /app
cat /app/.env

echo Installing Docker

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

echo Installing Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

cd /app && docker-compose up -d && docker-compose logs -f

EOF

  tags = {
    Name = "snort"
  }
}
data "aws_vpc" "selected" {
  id = module.vpc.vpc_id
}

//resource "aws_eip" "this" {
//  vpc = true
//}
//
//resource "aws_eip_association" "eip_assoc" {
//  instance_id = aws_instance.web.id
//  allocation_id = aws_eip.this.id
//}

output "ec2_dns" {
  value = "http://${aws_instance.web.public_dns}"
}
//output "ec2_static_ip" {
//  value = aws_eip.this.public_ip
//}
