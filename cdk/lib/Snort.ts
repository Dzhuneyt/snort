import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import {Code} from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import {AuthorizationType, LambdaIntegration} from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import {RetentionDays} from "@aws-cdk/aws-logs";

interface Lambdas {
    urlSaveLambda: lambda.Function,
    urlGetLambda: lambda.Function,
}

export class Snort extends cdk.Stack {
    private table: Table;
    private lambdas: Lambdas;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.createDynamoTable();
        this.createLambdas();
        this.createApiGateway();
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
        const api = new apigateway.RestApi(this, 'api', {
            defaultMethodOptions: {
                authorizationType: AuthorizationType.NONE,
                apiKeyRequired: false,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
            }
        });
        api.root.addMethod('ANY');

        const apiUrlsResource = api.root.addResource('urls', {
            defaultMethodOptions: {
                apiKeyRequired: false,
                authorizationType: AuthorizationType.NONE,
            }
        });
        apiUrlsResource.addMethod('POST', new LambdaIntegration(this.lambdas.urlSaveLambda));
        apiUrlsResource.addResource('{id}').addMethod('GET', new LambdaIntegration(this.lambdas.urlGetLambda));
    }

    private createDynamoTable() {
        this.table = new dynamodb.Table(this, 'urls', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
