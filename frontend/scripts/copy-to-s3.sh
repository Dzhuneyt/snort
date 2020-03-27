#!/bin/sh -

BUCKET=$(aws cloudformation describe-stacks \
  --stack-name snort-app-production \
  --query "Stacks[0].Outputs[?ExportName=='frontend-bucket-production'].OutputValue" \
  --output text)

  echo Copying frontend dist folder to bucket "$BUCKET"

  aws s3 cp ./dist/frontend s3://"$BUCKET" --recursive
