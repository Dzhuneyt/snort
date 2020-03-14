import DynamoDB = require("aws-sdk/clients/dynamodb");

// Create the DynamoDB service object
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

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
};
