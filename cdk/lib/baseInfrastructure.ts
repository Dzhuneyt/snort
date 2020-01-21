import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ec2 from '@aws-cdk/aws-ec2';
import {InstanceClass, InstanceSize, InstanceType, SubnetType} from '@aws-cdk/aws-ec2';

export class BaseInfrastructure extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repoBackend = new ecr.Repository(this, 'Backend', {
            repositoryName: 'backend',
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Configure the `natGatewayProvider` when defining a Vpc
        const natGatewayProvider = ec2.NatProvider.instance({
            instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.NANO),
        });
        const vpc = new ec2.Vpc(this, 'Snort', {
            natGatewayProvider: natGatewayProvider,
            cidr: '10.0.0.0/21',
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Ingress',
                    subnetType: SubnetType.PUBLIC,
                    reserved: true
                },
                {
                    cidrMask: 24,
                    name: 'Application',
                    subnetType: SubnetType.PRIVATE,
                    reserved: true
                },
                {
                    cidrMask: 28,
                    name: 'Database',
                    subnetType: SubnetType.ISOLATED,
                    reserved: true
                }
            ],
            natGateways: 1,
        });

        const vpcOutout = new cdk.CfnOutput(vpc, "vpc_id", {
            value: vpc.vpcId,
            exportName: 'vpc:id'
        });
    }

}
