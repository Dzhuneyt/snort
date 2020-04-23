import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, RemovalPolicy, StackProps} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import {Code} from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import {AuthorizationType, EndpointType, LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import {RetentionDays} from "@aws-cdk/aws-logs";
import {CorsOptions} from "@aws-cdk/aws-apigateway/lib/cors";
import {BucketAccessControl} from "@aws-cdk/aws-s3";
import {
    ARecord,
    HostedZone,
    IHostedZone,
    PublicHostedZone,
    RecordTarget,
    ZoneDelegationRecord
} from "@aws-cdk/aws-route53";
import {Certificate, DnsValidatedCertificate, ICertificate} from "@aws-cdk/aws-certificatemanager";
import {AutoDeleteBucket} from '@mobileposse/auto-delete-bucket';
import {CloudFrontAllowedMethods, CloudFrontWebDistribution, ViewerCertificate} from "@aws-cdk/aws-cloudfront";
import {ApiGateway, CloudFrontTarget} from "@aws-cdk/aws-route53-targets";
import {main} from "ts-node/dist/bin";


interface Lambdas {
    urlSaveLambda: lambda.Function,
    urlGetLambda: lambda.Function,
}

export interface Props extends StackProps {
}

export class App extends cdk.Stack {
    private table: Table;
    private lambdas: Lambdas;
    private api: RestApi;
    private props: Props;
    public bucket: AutoDeleteBucket;
    private cloudFrontDistribution: CloudFrontWebDistribution;

    private envName = process.env.STAGE;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);
        this.props = props;

        this.createDynamoTable();
        this.createLambdas();
        this.createApiGateway();
        this.createFrontendInfrastructure();
    }

    private createLambdas() {
        const urlSaveLambda = new lambda.Function(this, 'url-post', {
            code: Code.fromAsset(`${__dirname}/../dist/lambdas`),
            handler: 'shorten-url.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: this.table.tableName,
            },
            logRetention: RetentionDays.SIX_MONTHS,
        });
        const urlGetLambda = new lambda.Function(this, 'url-get', {
            code: Code.fromAsset(`${__dirname}/../dist/lambdas`),
            handler: 'get-original-url.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: this.table.tableName,
            },
            logRetention: RetentionDays.SIX_MONTHS,
        });

        // Allow the Lambdas to read/write from DynamoDB
        this.table.grantReadWriteData(urlSaveLambda);
        this.table.grantReadWriteData(urlGetLambda);

        this.lambdas = {
            urlGetLambda,
            urlSaveLambda,
        }
    }

    private createApiGateway() {
        const defaultCors: CorsOptions = {
            allowHeaders: ['*'],
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
            disableCache: true,
        };

        this.api = new apigateway.RestApi(this, process.env.STAGE + '-api', {
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
        apiUrlsResource.addMethod('POST', new LambdaIntegration(this.lambdas.urlSaveLambda));
        apiUrlsResource.addResource('{id}', {
            defaultCorsPreflightOptions: defaultCors,
        }).addMethod('GET', new LambdaIntegration(this.lambdas.urlGetLambda));
    }

    private createDynamoTable() {
        this.table = new dynamodb.Table(this, 'urls', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        });
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
