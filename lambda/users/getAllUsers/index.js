const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let params;
    if(event.queryStringParameters !== undefined && event.queryStringParameters.username !== undefined){
        if(event.queryStringParameters.username === "") return noDataFoundResponse();
        params = {
            TableName: "users",
            FilterExpression: "begins_with(username, :username)",
            ExpressionAttributeValues: {
                ":username": event.queryStringParameters.username,
            }
        };
    }else{
        params = {TableName: "users"};
    }
    let data = await scan(params);
    if(!data || data.Items.length === 0) return noDataFoundResponse();
    return returnOkResponse(data);
};

function scan(params){
    return new Promise((resolve, reject) => {
        docClient.scan(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function returnOkResponse(data) {
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}

const noDataFoundResponse = function () {
    return {
        statusCode: 404,
        body: JSON.stringify({
            Error: "No data was found for the resource",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
};

