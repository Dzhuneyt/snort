import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, StackProps} from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import {AuthorizationType, LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway';
import {CorsOptions} from "@aws-cdk/aws-apigateway/lib/cors";
import {BucketAccessControl} from "@aws-cdk/aws-s3";
import {Certificate} from "@aws-cdk/aws-certificatemanager";
import {AutoDeleteBucket} from '@mobileposse/auto-delete-bucket';
import {CloudFrontAllowedMethods, CloudFrontWebDistribution, ViewerCertificate} from "@aws-cdk/aws-cloudfront";
import {Table} from "./constructs/Table";
import {UrlGet} from "./constructs/UrlGet";
import {UrlSave} from "./constructs/UrlSave";


export interface Props extends StackProps {
}

export class App extends cdk.Stack {
    private readonly table: Table;
    private api: RestApi;
    private props: Props;
    public bucket: AutoDeleteBucket;
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

        const defaultCors: CorsOptions = {
            allowHeaders: ['*'],
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
            disableCache: true,
        };

        this.api = new apigateway.RestApi(this, `${process.env.STAGE}-api`, {
            endpointExportName: `backend-url-${process.env.STAGE}`,
            retainDeployments: false,
            defaultMethodOptions: {
                authorizationType: AuthorizationType.NONE,
                apiKeyRequired: false,
            },
            defaultCorsPreflightOptions: defaultCors,
        });

        new CfnOutput(this, 'backend-url', {
            value: this.api.url,
        });

        this.api.root.addMethod('ANY');

        const apiUrlsResource = this.api.root.addResource('urls', {
            defaultCorsPreflightOptions: defaultCors,
            defaultMethodOptions: {
                apiKeyRequired: false,
                authorizationType: AuthorizationType.NONE,
            }
        });
        apiUrlsResource.addMethod('POST', new LambdaIntegration(urlSaveLambda));
        apiUrlsResource
            .addResource('{id}', {
                defaultCorsPreflightOptions: defaultCors,
            })
            .addMethod('GET', new LambdaIntegration(urlGetLambda));
    }

    private createFrontendInfrastructure() {
        this.bucket = new AutoDeleteBucket(this, 'frontend', {
            accessControl: BucketAccessControl.PUBLIC_READ,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html'
        });
        new CfnOutput(this, 'frontend-bucket', {
            value: this.bucket.bucketName,
            exportName: 'frontend-bucket-' + this.envName
        });

        const certificate = this.envName === 'production'
            ? Certificate.fromCertificateArn(this, 'certificate', 'arn:aws:acm:us-east-1:216987438199:certificate/3913de84-07ea-4d66-a4c0-0918d03e1cc3')
            : undefined;

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

                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            allowedMethods: CloudFrontAllowedMethods.ALL,
                            compress: true,
                            defaultTtl: Duration.seconds(10),
                        },
                    ]
                }
            ]
        });
    }
}
