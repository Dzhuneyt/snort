#!/bin/sh -

BACKEND_URL=$(aws cloudformation describe-stacks \
  --stack-name snort-app-production \
  --query "Stacks[0].Outputs[?OutputKey=='backendurl'].OutputValue" \
  --output text)

  echo "$BACKEND_URL"