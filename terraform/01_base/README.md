This Terraform module defines the essential parts of the application, including:
* AWS ECR repos
* AWS VPC and subnets
* IAM roles and policies, required to run the CI procedures. These CI proceduires need a limited set of permission so these policies need to be crafter carefully. As such, this base infrastructure need to be provisioned by a super admin.
