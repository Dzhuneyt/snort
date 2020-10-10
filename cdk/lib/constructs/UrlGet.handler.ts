// Create the DynamoDB service object
import {DynamoDB} from "aws-sdk";

const ddb = new DynamoDB({apiVersion: '2012-08-10'});

export const handler = async (event: any) => {
    console.log(event);

    const request = event;
    console.log('request', request);

    const id = request.pathParameters?.id;

    if (!id) {
        throw new Error('Invalid ID');
    }

    const params: DynamoDB.GetItemInput = {
        TableName: process.env.TABLE_NAME as string,
        Key: {
            'id': {S: id},
        },
        AttributesToGet: [
            "id",
            "url"
        ]
    };

    // Call DynamoDB to add the item to the table
    const dbRead = await ddb.getItem(params).promise();

    if (dbRead.$response.error) {
        throw new Error(dbRead.$response.error.message);
    }

    if (!dbRead.Item) {
        throw new Error('Can not find item');
    }

    const response = DynamoDB.Converter.unmarshall(dbRead.Item);

    const headers = {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
    };
};
