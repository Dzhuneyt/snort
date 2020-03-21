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
import {ARecord, HostedZone, IHostedZone, RecordTarget} from "@aws-cdk/aws-route53";
import {ICertificate} from "@aws-cdk/aws-certificatemanager";
import {AutoDeleteBucket} from '@mobileposse/auto-delete-bucket';
import {CloudFrontAllowedMethods, CloudFrontWebDistribution, ViewerCertificate} from "@aws-cdk/aws-cloudfront";
import {CloudFrontTarget} from "@aws-cdk/aws-route53-targets";


interface Lambdas {
    urlSaveLambda: lambda.Function,
    urlGetLambda: lambda.Function,
}

export interface Props extends StackProps {
    route53: IHostedZone,
    route53certificate: ICertificate,
}

export class Snort extends cdk.Stack {
    private table: Table;
    private lambdas: Lambdas;
    private api: RestApi;
    private props: Props;
    private bucket: AutoDeleteBucket;
    private cloudFrontDistribution: CloudFrontWebDistribution;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);
        this.props = props;
        this.createDynamoTable();
        this.createLambdas();
        this.createApiGateway();
        this.createFrontendBucket();
        this.createCloudfront();
        this.attachRoute53ToCloudfront();
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

        // const certificate = new DnsValidatedCertificate(this, 'certificate', {
        //     domainName: 'snort.cc',
        //     hostedZone: this.props.route53,
        //     subjectAlternativeNames: [
        //         "production.snort.cc",
        //         "staging.snort.cc",
        //     ],
        // });

        this.api = new apigateway.RestApi(this, process.env.STAGE + '-api', {
            domainName: {
                domainName: process.env.STAGE + '.snort.cc',
                certificate: this.props.route53certificate,
                endpointType: EndpointType.EDGE,
            },
            endpointExportName: `${process.env.STAGE}-backend-url`,
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

        // new ARecord(this, process.env.STAGE + '-domain-a-record', {
        //     zone: this.props.route53,
        //     recordName: process.env.STAGE,
        //     ttl: Duration.seconds(10),
        //     target: RecordTarget.fromAlias(new ApiGateway(this.api))
        // });
    }

    private createDynamoTable() {
        this.table = new dynamodb.Table(this, 'urls', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }

    private createFrontendBucket() {
        this.bucket = new AutoDeleteBucket(this, 'frontend', {
            accessControl: BucketAccessControl.PUBLIC_READ,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html'
        });
        // const bucket = new Bucket(this, 'frontend', {
        //     accessControl: BucketAccessControl.PUBLIC_READ,
        //     publicReadAccess: true,
        //     websiteIndexDocument: 'index.html',
        //     websiteErrorDocument: 'index.html'
        // });
        new CfnOutput(this, 'frontend-url', {
            value: this.bucket.bucketWebsiteUrl,
        });
        new CfnOutput(this, 'frontend-bucket', {
            value: this.bucket.bucketName,
        });
    }

    private createCloudfront() {
        this.cloudFrontDistribution = new CloudFrontWebDistribution(this, 'cloudfront', {
            viewerCertificate: ViewerCertificate.fromAcmCertificate(this.props.route53certificate, {
                aliases: ["snort.cc"],
            }),
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

    private attachRoute53ToCloudfront() {
        const domain = HostedZone.fromLookup(this, 'domain', {
            domainName: 'snort.cc',
        });
        new ARecord(this, 'domain-to-cf', {
            zone: domain,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.cloudFrontDistribution)),
        })

    }
}
