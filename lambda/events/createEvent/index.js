const AWS = require('aws-sdk');
const uuid = require('uuid/v4');
const docClient = new AWS.DynamoDB.DocumentClient();

function validateBodyParams(body) {
    return body !== null && body.name !== null && body.location !== null &&
        body.date !== null && body.date.from !== null && body.date.to !== null;
}

exports.handler = async (event) => {

    if(event.body != null){
        let body = JSON.parse(sanitize(event.body));
        console.log(validateBodyParams(body));
        if(!validateBodyParams(body)) return errorResponse();
        let username = event.requestContext.authorizer.claims.email;
        let params = {
            Item: {
                id: uuid(),
                name: body.name,
                owner: username,
                location: body.location,
                date: {
                    from: body.date.from,
                    to: body.date.to
                },
            },
            TableName: "events"
        };
        let data = await putItem(params);
        if(data === undefined) return couldNotCreateItemResponse();
        return returnOkResponse();
    }else errorResponse()
};

function putItem(params){
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
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
        statusCode: 400,
        body: JSON.stringify({
            Error: "Bad Request",
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
