const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    if(event.body !== null){
        let body = JSON.parse(sanitize(event.body));
        let params = {
            Item: {
                name: body.name,
                surnames: body.surnames,
                username: body.username,
                bornDate: body.bornDate,
                ownedEvents: [],
                attendEvents: []
            },
            TableName: "users",
            ConditionExpression: "attribute_not_exists(username)"
        };
        let data = await putItem(params);
        if(data === undefined) return couldNotCreateItemResponse();
        if(data === 400) return usernameAlreadyExistsResponse();
        return returnOkResponse();
    }else errorResponse()
};

function putItem(params){
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err){
                console.log(err);
                if(err.code === 'ConditionalCheckFailedException') resolve(400);
                reject(err);
            }
            else resolve(data);
        });
    })
}

function usernameAlreadyExistsResponse(){
    return {
        statusCode: 409,
        body: JSON.stringify({
            Error: "Specified username already exists",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}

function couldNotCreateItemResponse() {
    return {
        statusCode: 500,
        body: JSON.stringify({
            Error: "An internal error has occurred while saving into database",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}

function errorResponse() {
    return {
        statusCode: 500,
        body: JSON.stringify({
            Error: "An internal error has occurred",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}

function returnOkResponse() {
    return {
        statusCode: 201,
        body: JSON.stringify({
            Message: "Saved object into database"
        })
    };
}

function sanitize(stringToBeSanitized){
    return stringToBeSanitized.replace('<script>', '&lt;script&gt;')
}
