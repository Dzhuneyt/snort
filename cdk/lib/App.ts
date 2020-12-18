import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, StackProps} from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway';
import {CorsOptions} from "@aws-cdk/aws-apigateway/lib/cors";
import {BucketAccessControl} from "@aws-cdk/aws-s3";
import {Certificate} from "@aws-cdk/aws-certificatemanager";
import {AutoDeleteBucket} from '@mobileposse/auto-delete-bucket';
import {
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    OriginAccessIdentity,
    ViewerCertificate
} from "@aws-cdk/aws-cloudfront";
import {Table} from "./constructs/Table";
import {UrlGet} from "./constructs/UrlGet";
import {UrlSave} from "./constructs/UrlSave";
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
import * as path from "path";

export interface Props extends StackProps {
}

export class App extends cdk.Stack {
    public bucket: AutoDeleteBucket;
    private readonly table: Table;
    private api: RestApi;
    private props: Props;
    private cloudFrontDistribution: CloudFrontWebDistribution;

    private envName = process.env.STAGE;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);
        this.props = props;

        this.table = new Table(this, 'urls', {});
        this.createApiGateway();
        this.createFrontendInfrastructure();
    }

    private createApiGateway() {

        const urlSaveLambda = new UrlSave(this, 'url-save', {table: this.table}).lambda;
        const urlGetLambda = new UrlGet(this, 'url-get', {table: this.table}).lambda;

        const defaultCorsPreflightOptions: CorsOptions = {
            allowHeaders: ['*'],
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
            disableCache: true,
        };

        this.api = new apigateway.RestApi(this, `${process.env.STAGE}-api`, {
            endpointExportName: `backend-url-${process.env.STAGE}`,
            defaultCorsPreflightOptions,
            deployOptions: {
                throttlingRateLimit: 20,
                throttlingBurstLimit: 10,
            }
        });

        new CfnOutput(this, 'backend-url', {
            value: this.api.url,
        });

        this.api.root.addMethod('ANY');

        const apiUrlsResource = this.api.root
            .addResource('api')
            .addResource('urls', {
                defaultCorsPreflightOptions,
            });
        apiUrlsResource.addMethod('POST', new LambdaIntegration(urlSaveLambda));
        apiUrlsResource
            .addResource('{id}', {
                defaultCorsPreflightOptions,
            })
            .addMethod('GET', new LambdaIntegration(urlGetLambda));
    }

    private createFrontendInfrastructure() {
        this.bucket = new AutoDeleteBucket(this, 'frontend', {
            accessControl: BucketAccessControl.PRIVATE,
        });

        new BucketDeployment(this, 'frontend-deployment', {
            prune: true,
            sources: [
                Source.asset(path.resolve(__dirname, '../../frontend/dist/frontend')),
            ],
            destinationBucket: this.bucket,
        });

        new CfnOutput(this, 'frontend-bucket', {
            value: this.bucket.bucketName,
            exportName: 'frontend-bucket-' + this.envName
        });

        const certificate = this.envName === 'production'
            ? Certificate.fromCertificateArn(this, 'certificate', 'arn:aws:acm:us-east-1:216987438199:certificate/3913de84-07ea-4d66-a4c0-0918d03e1cc3')
            : undefined;

        const originAccessIdentity = new OriginAccessIdentity(this, 'oai', {});
        this.bucket.grantRead(originAccessIdentity);

        this.cloudFrontDistribution = new CloudFrontWebDistribution(this, 'cloudfront', {
            viewerCertificate: certificate ? ViewerCertificate.fromAcmCertificate(certificate, {
                aliases: ["snort.cc"],
            }) : undefined,
            defaultRootObject: 'index.html',
            errorConfigurations: [
                {
                    errorCachingMinTtl: 10,
                    errorCode: 404,
                    responsePagePath: '/index.html',
                    responseCode: 200,
                }
            ],
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.bucket,
                        originAccessIdentity,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            allowedMethods: CloudFrontAllowedMethods.ALL,
                            compress: true,
                            defaultTtl: Duration.seconds(10),
                        },
                    ]
                },
                {
                    customOriginSource: {
                        domainName: this.api.url.split("/")[2],
                        originPath: '/prod',
                    },
                    behaviors: [
                        {
                            allowedMethods: CloudFrontAllowedMethods.ALL,
                            pathPattern: '/api/*',
                            maxTtl: Duration.seconds(1),
                            defaultTtl: Duration.seconds(1),
                        }
                    ]
                }
            ]
        });

        new CfnOutput(this, 'cloudfront-url', {
            value: this.cloudFrontDistribution.distributionDomainName,
        })
    }
}
