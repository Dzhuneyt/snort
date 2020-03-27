#!/bin/sh -

STAGE=$1

if [ -z "$STAGE" ]; then
  echo Please provide the environment or branch name as first argument
  exit 2
fi

BUCKET=$(aws cloudformation describe-stacks \
  --stack-name snort-app-production \
  --query "Stacks[0].Outputs[?ExportName=='frontend-bucket-${STAGE}'].OutputValue" \
  --output text)

if [ -z "$BUCKET" ]; then
  echo Can not find S3 bucket to deploy to
  exit 2
fi

echo Copying frontend dist folder to bucket "$BUCKET"

aws s3 cp ./dist/frontend s3://"$BUCKET" --recursive
