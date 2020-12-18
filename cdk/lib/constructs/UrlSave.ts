import {Construct} from "@aws-cdk/core";
import {Table} from "@aws-cdk/aws-dynamodb";
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";

export class UrlSave extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: {
        table: Table,
    }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            depsLockFilePath: path.resolve(__dirname, './../../'),
            environment: {
                TABLE_NAME: props.table.tableName,
            },
        });

        // Allow the Lambdas to read/write from DynamoDB
        props.table.grantReadWriteData(this.lambda);
    }
}