# Infrastructure

The following folder contains the definition of the entire infrastructure of the app, in terms of Terraform modules.

Note that each module lives semi-independently, meaning that you need to deploy it independently using the command `cd ./terraform/0X_XXXX && terraform init && terraform apply`, however the order of deployment is important (hence the numeric prefixes). For example, you can not create an ECS cluster without having a VPC first, so the VPC creation is defined in an earlier stack. The latter stack will simply refer to an already created VPC by its name.

## Overview:
### 01_base
* 1x VPC
* 3x private subnets
* 3x public subnets
* 3x ECR repos for hosting Docker Images

### 02_database
* 1x RDS (MySQL)
* 5x Systems Manager parameters (that store DB host, user, pass, etc, to be imported and used by later stacks)


### 03_cluster
* 1x ECS cluster
* 1x "Spot" EC2 autoscaling group with variable EC2 instances depending on workload
* 1x "On Demand" EC2 autoscaling group with variable EC2 instances depending on workload

### 04_service
* 1x Task definition that represent the containers of the service (images hosted on ECR, created earlier)
* 1x ECS service that defines the minimum/maximum number of instances, container spreading mechanism across EC2 instances, etc
