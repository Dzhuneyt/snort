data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name = "name"
    values = [
      "ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*"]
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
  ami = data.aws_ami.ubuntu.id
  instance_type = "t3a.nano"
  vpc_security_group_ids = [
    module.http_80_security_group.this_security_group_id,
    module.ssh_security_group.this_security_group_id,
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
sudo apt-get install -y git

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

# Add the deploy keys to this server
echo "${file("./deploy_keys/snort")}" > /home/$SSH_USER/.ssh/id_rsa
chmod 600 /home/$SSH_USER/.ssh/id_rsa

cat /home/$SSH_USER/.ssh/id_rsa

# Start SSH agent and add the new key
eval "$(ssh-agent -s)"
ssh-add /home/$SSH_USER/.ssh/id_rsa

mkdir /app
ssh-agent bash -c 'ssh-add /home/ubuntu/.ssh/id_rsa; git clone git@github.com:Dzhuneyt/snort.git'

#git clone --verbose git@github.com:Dzhuneyt/snort.git /app
ls /app
EOF

  tags = {
    Name = "snort"
  }
}
data "aws_vpc" "selected" {
  id = "vpc-00600b553bbc46113"
}
module "http_80_security_group" {
  source = "terraform-aws-modules/security-group/aws//modules/http-80"
  version = "~> 3.0"

  # omitted...
  name = "Allow HTTP traffic to Snort EC2 instance"
  vpc_id = data.aws_vpc.selected.id
  ingress_cidr_blocks = [
    "0.0.0.0/0"
  ]
  egress_cidr_blocks = [
    "0.0.0.0/0"
  ]
}
module "ssh_security_group" {
  source = "terraform-aws-modules/security-group/aws//modules/ssh"
  version = "~> 3.0"

  # omitted...
  name = "Allow SSH traffic to Snort EC2 instance"
  vpc_id = data.aws_vpc.selected.id
  ingress_cidr_blocks = [
    "0.0.0.0/0"
  ]
  egress_cidr_blocks = [
    "0.0.0.0/0"
  ]
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
