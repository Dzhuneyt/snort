import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ec2 from '@aws-cdk/aws-ec2';
import {InstanceClass, InstanceSize, InstanceType, SubnetType} from '@aws-cdk/aws-ec2';

export class BaseInfrastructure extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = this.createVpc();

        const repos = [
            'backend',
            'frontend',
            'nginx',
        ];
        repos.forEach(repo => {
            const repoBackend = new ecr.Repository(this, repo, {
                repositoryName: `snort/${repo}`,
                removalPolicy: RemovalPolicy.DESTROY,
            });
            new cdk.CfnOutput(vpc, `ecr:${repo}`, {
                value: repoBackend.repositoryUri,
                exportName: `ecr:${repo}`
            });
        });

    }

    private createVpc(): ec2.Vpc {
        // Configure the `natGatewayProvider` when defining a Vpc
        // Nat instances are cheaper than NAT gateway but less available
        const natGatewayProvider = ec2.NatProvider.instance({
            instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.NANO),
        });
        const vpc = new ec2.Vpc(this, 'Snort', {
            natGatewayProvider: natGatewayProvider,
            cidr: '10.0.0.0/21',
            natGateways: 1,
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });

        new cdk.CfnOutput(vpc, "vpc:id", {
            value: vpc.vpcId,
            exportName: 'vpc:id'
        });

        return vpc;
    }

}
