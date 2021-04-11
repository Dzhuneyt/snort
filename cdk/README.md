### Create a CI pipeline that will auto-provision an environment, based on a Git branch called "mybranch"

```shell
cd ./cdk
export BRANCH=mybranch
npx cdk deploy 'snort-ci*' --context branch=$BRANCH
```
