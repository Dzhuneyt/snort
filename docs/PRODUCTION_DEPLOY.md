# OUTDATED CONTENT BELOW
1. npm run terraform:infrastructure - create the base infrastructure, including the ECR repos
2. npm run build:prod - Create the stack of Docker images (locally)
3. npm run util:docker-compose-push - Push Docker images to AWS ECR
4. npm run terraform:services - Deploy the current version from ECR to AWS ECR
