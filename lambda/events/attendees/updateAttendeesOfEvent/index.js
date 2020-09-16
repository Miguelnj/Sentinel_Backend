const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

async function updateAttendees(eventId, body) {
    if(!body.attendees) return false;
    let attendees = body.attendees;
    for(let key in attendees){
        let params = buildParams(eventId, key, attendees[key]);
        await updateItem(params);
    }
    return true;
}

exports.handler = async (event) => {
    console.log(event);
    if(event.pathParameters != null && event.body !== undefined ){
        let identifier = event.pathParameters.identifier;
        let body = JSON.parse(sanitize(event.body));
        let updatedSuccess = await updateAttendees(identifier, body);
        if(updatedSuccess) return returnOkResponse();
    }
    return errorResponse();
};

function buildParams(eventId, username, status) {
    return {
        TableName: "attendees_events",
        Key: {
            "user_id": username,
            "event_id": eventId,
        },
        UpdateExpression: "SET hasAttended = :status",
        ExpressionAttributeValues: {
            ":status": status
        }
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
        statusCode: 200,
        body: JSON.stringify({
            Message: "Items successfully updated if exist",
        })
    };
}


function updateItem(params){
    return new Promise((resolve, reject) => {
        docClient.update(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function sanitize(stringToBeSanitized){
    return stringToBeSanitized.replace('<script>', '&lt;script&gt;')
}