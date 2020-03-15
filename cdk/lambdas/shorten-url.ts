import {randomBytes} from 'crypto';
import DynamoDB = require("aws-sdk/clients/dynamodb");

const getRandomId = (length: number) => {
    return randomBytes(Math.floor(length / 2)).toString('hex');
};

// Create the DynamoDB service object
const ddb = new DynamoDB({apiVersion: '2012-08-10'});

export const handler = async (event: any) => {
    console.log(event);
    const id = getRandomId(6);
    console.log('ID', id);

    const requestArgs = JSON.parse(event.body);
    console.log('requestArgs', requestArgs);

    const params: DynamoDB.PutItemInput = {
        TableName: process.env.TABLE_NAME as string,
        Item: {
            'id': {S: id},
            'url': {S: requestArgs['url']}
        }
    };

    // Call DynamoDB to add the item to the table
    const dbWrite = await ddb.putItem(params).promise();

    if (dbWrite.$response.error) {
        throw new Error(dbWrite.$response.error.message);
    }

    const response = {
        id
    };

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
