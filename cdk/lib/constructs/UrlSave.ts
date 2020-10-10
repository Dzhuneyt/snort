import {Construct, Stack} from "@aws-cdk/core";
import {Table} from "@aws-cdk/aws-dynamodb";
import {RetentionDays} from "@aws-cdk/aws-logs";
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";

export class UrlSave extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: {
        table: Table,
    }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            projectRoot: path.resolve(__dirname, './../../'),
            environment: {
                TABLE_NAME: props.table.tableName,
            },
        });

        // Allow the Lambdas to read/write from DynamoDB
        props.table.grantReadWriteData(this.lambda);
    }
}