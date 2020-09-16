const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(event);
    if(event.pathParameters != null){
        let params = {
            TableName: "attendees_events",
            Key: {
                "user_id": event.pathParameters.userId,
                "event_id": event.pathParameters.identifier,
            },
        };
        await deleteItem(params);
        return returnOkResponse();
    }else{
        return errorResponse();
    }
};

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
        statusCode: 200,
        body: JSON.stringify({
            Message: "Item successfully deleted if exists"
        })
    };
}

function deleteItem(params){
    return new Promise((resolve, reject) => {
        docClient.delete(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}