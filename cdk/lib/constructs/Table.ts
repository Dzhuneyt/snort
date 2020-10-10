import * as OriginalTable from '@aws-cdk/aws-dynamodb';
import {Construct, RemovalPolicy} from "@aws-cdk/core";
import {BillingMode, TableProps} from "@aws-cdk/aws-dynamodb";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class Table extends OriginalTable.Table {
    constructor(scope: Construct, id: string, props: Partial<TableProps>) {
        super(scope, id, {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            ...props,
        });
    }
}