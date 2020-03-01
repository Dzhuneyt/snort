#!/usr/bin/env bash

set -e

git clone https://github.com/tfutils/tfenv.git ~/.tfenv
export PATH="$HOME/.tfenv/bin:$PATH"
tfenv --version
tfenv install latest
tfenv use latest
