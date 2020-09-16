const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

function missingDataResponse() {
    return {
        statusCode: 400,
        body: JSON.stringify({
            Error: "Missing body attribute",
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}

function sanitize(stringToBeSanitized){
    return stringToBeSanitized.replace('<script>', '&lt;script&gt;')
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

function query(params){
    return new Promise((resolve, reject) => {
        docClient.query(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function putItem(params){
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
}

function returnOkResponse() {
    return {
        statusCode: 200,
        body: JSON.stringify({
            Message: "Item successfully added if not present"
        })
    };
}

async function checkIfUserIsAlreadyAttendeeOfEvent(username, eventId) {
    let params = {
        TableName: "attendees_events",
        KeyConditionExpression: "#event_id = :event_id AND #user_id = :user_id",
        ExpressionAttributeNames: {
            "#event_id" : "event_id",
            "#user_id" : "user_id"
        },
        ExpressionAttributeValues: {
            ":event_id" : eventId,
            ":user_id" : username
        }
    }
    let data = await query(params);
    return data !== undefined && data.Items.length !== 0;

}

async function saveUserInEvent(username, eventId) {
    let params = {
        Item: {
            event_id: eventId,
            user_id: username,
            hasAttended: false,
            createdAt: new Date().toISOString(),
        },
        TableName: "attendees_events"
    };
    let data = await putItem(params);
    if(data === undefined) return couldNotCreateItemResponse();
    return returnOkResponse();
}

exports.handler = async (event) => {
    if(event.body !== undefined && event.pathParameters.identifier !== undefined){
        let body = JSON.parse(sanitize(event.body));
        if(event.body.username !== undefined) return missingDataResponse();
        let isUserAlreadyPresentInEvent = await checkIfUserIsAlreadyAttendeeOfEvent(body.username, event.pathParameters.identifier);
        if (isUserAlreadyPresentInEvent) return returnOkResponse();
        else await saveUserInEvent(body.username, event.pathParameters.identifier);
    }else return missingDataResponse();
    return returnOkResponse();
};

