import {Construct, Stack, StackProps} from "@aws-cdk/core";
import * as s3deployment from "@aws-cdk/aws-s3-deployment"
import {Bucket} from "@aws-cdk/aws-s3";

interface Props extends StackProps {
    bucket: Bucket;
}

export class SnortFrontend extends Stack {

    private envName = process.env.STAGE;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        new s3deployment.BucketDeployment(this, 'frontend_deploy', {
            sources: [s3deployment.Source.asset('../frontend/dist/frontend')],
            destinationBucket: props.bucket,
        });

    }
}