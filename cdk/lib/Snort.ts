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
import {DnsValidatedCertificate, ICertificate} from "@aws-cdk/aws-certificatemanager";
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

export class Snort extends cdk.Stack {
    private table: Table;
    private lambdas: Lambdas;
    private api: RestApi;
    private props: Props;
    public bucket: AutoDeleteBucket;
    private cloudFrontDistribution: CloudFrontWebDistribution;

    private envName = process.env.STAGE;
    private certificateFrontend: DnsValidatedCertificate;
    private certificateBackend: DnsValidatedCertificate;
    private mainDomain: IHostedZone;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);
        this.props = props;

        const mainDomain = PublicHostedZone.fromLookup(this, 'tld', {
            domainName: "snort.cc",
        });

        const subdomain = new PublicHostedZone(this, 'route53', {
            zoneName: this.envName + '.snort.cc',
        });

        const zoneDelegation = new ZoneDelegationRecord(this, 'route53_subdomain', {
            zone: mainDomain,
            recordName: subdomain.zoneName,
            nameServers: subdomain.hostedZoneNameServers! // <-- the "!" means "I know this won't be undefined"
        });
        this.mainDomain = subdomain;
        if (!mainDomain) {
            throw new Error('Can not find route53 hosted zone for domain ' + this.envName + '.snort.cc');
        }
        this.createCertificates();
        this.createDynamoTable();
        this.createLambdas();
        this.createApiGateway();
        this.createFrontendInfrastructure();
        this.createRoute53Records();
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
            domainName: {
                domainName: 'backend.' + process.env.STAGE + '.snort.cc',
                certificate: this.certificateBackend,
                endpointType: EndpointType.EDGE,
            },
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
        // const bucket = new Bucket(this, 'frontend', {
        //     accessControl: BucketAccessControl.PUBLIC_READ,
        //     publicReadAccess: true,
        //     websiteIndexDocument: 'index.html',
        //     websiteErrorDocument: 'index.html'
        // });
        // new CfnOutput(this, 'frontend-url', {
        //     value: this.bucket.bucketWebsiteUrl,
        // });
        // new CfnOutput(this, 'frontend-bucket', {
        //     value: this.bucket.bucketName,
        // });

        this.cloudFrontDistribution = new CloudFrontWebDistribution(this, 'cloudfront', {
            viewerCertificate: ViewerCertificate.fromAcmCertificate(this.certificateFrontend, {
                aliases: [this.envName + ".snort.cc"],
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

    private createCertificates() {
        // Create certificate for the frontend
        this.certificateFrontend = new DnsValidatedCertificate(this, 'cert-frontend', {
            domainName: this.mainDomain.zoneName,
            hostedZone: this.mainDomain,

            // CloudFront requires all certificates be in us-east-1
            region: 'us-east-1',
        });

        // Create certificate for the backend
        this.certificateBackend = new DnsValidatedCertificate(this, 'cert-backend', {
            domainName: "backend." + this.mainDomain.zoneName,
            hostedZone: this.mainDomain,

            // CloudFront requires all certificates be in us-east-1
            region: 'us-east-1',
        });


    }

    private createRoute53Records() {
        // Forward request to this domain, to the CF distribution
        new ARecord(this, 'route53-a-record-frontend', {
            zone: this.mainDomain,
            ttl: Duration.seconds(10),
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.cloudFrontDistribution)),
        });

        // Forward requests from the backend subdomain to AppSync
        new ARecord(this, 'route53-a-record-backend', {
            zone: this.mainDomain,
            recordName: "backend." + this.mainDomain.zoneName,
            ttl: Duration.seconds(10),
            target: RecordTarget.fromAlias(new ApiGateway(this.api))
        });
    }
}
