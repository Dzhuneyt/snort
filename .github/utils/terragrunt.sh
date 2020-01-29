#!/usr/bin/env bash

set -e

TERRAGRUNT_URL="https://github.com/gruntwork-io/terragrunt/releases/download/v0.21.11/terragrunt_linux_amd64"
wget --timestamping -O terragrunt ${TERRAGRUNT_URL}
chmod +x terragrunt
terragrunt -v

mv terragrunt /usr/local/bin
