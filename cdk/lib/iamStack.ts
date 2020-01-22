import * as cdk from '@aws-cdk/core';
import {ArnPrincipal, PolicyStatement, Role, User} from '@aws-cdk/aws-iam';

export class IamStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const github = new User(this, 'github', {
            path: '/github/',
            userName: 'github'
        });

        const role = new Role(this, 'GitHub-Role', {
            assumedBy: new ArnPrincipal(github.userArn),
            roleName: 'GitHub-Role'
        });

        role.addToPolicy(new PolicyStatement({
            resources: ['*'],
            actions: [
                // Allow Github to authenticate with ECR (e.g. do "docker-compose push")
                'ecr:GetAuthorizationToken'
            ],
        }));
        role.addToPolicy(new PolicyStatement({
            resources: ['arn:aws:ecr:*:*:repository/snort/*'],
            actions: [
                'ecr:InitiateLayerUpload'
            ],
        }));
        new cdk.CfnOutput(this, 'github.user.role.arn', {
            value: role.roleArn
        });

    }


}
