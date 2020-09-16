const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    if(event.pathParameters != null){
        let identifier = event.pathParameters.identifier;
        let username = event.requestContext.authorizer.claims.email;
        if(username !== identifier) return errorResponse();
        let params = {
            TableName: "users",
            Key:{
                username: identifier
            }
        };
        let data = await getItem(params);
        if(data.Item === undefined) return noDataFoundResponse();
        return returnOkResponse(data);
    }else return errorResponse();
};


function getItem(params){
    return new Promise((resolve, reject) => {
        docClient.get(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function errorResponse() {
    return {
        statusCode: 400,
        body: JSON.stringify({
            Error: "Bad request",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
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
            Error: "No data was found for the given identifier",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
};
