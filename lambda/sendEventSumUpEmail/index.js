const AWS = require('aws-sdk');
const ses = new AWS.SES({apiVersion: "2010-12-01", region: 'eu-central-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

async function getEvent(event) {
    let params = {
        TableName: "events",
        Key: {
            id: event
        }
    };
    let data = await getItem(params);
    return data.Item;
}

async function getUserFullName(username) {
    let params = {
        TableName: "users",
        Key: {
            username: username,
        }
    };
    let user = await getItem(params);
    return user.Item.name + " " + user.Item.surnames;
}

async function getEventAttendees(eventId) {
    let params = {
        TableName: "attendees_events",
        KeyConditionExpression: "#event_id = :event_id",
        ExpressionAttributeNames:{
            "#event_id": "event_id"
        },
        ExpressionAttributeValues: {
            ":event_id": eventId,
        }
    }

    let response = await query(params);
    let attendees = [];
    if(response.Items.length > 0){
        for(let j = 0; j < response.Items.length; j++){
            let userId = response.Items[j].user_id;
            let fullname = await getUserFullName(userId);
            let data = {fullname: fullname, username:userId , attended: response.Items[j].hasAttended}
            attendees.push(data);
        }
    }
    return attendees;
}

exports.handler = async (event) => {

    let username = event.requestContext.authorizer.claims.email;
    if (event.queryStringParameters === undefined || event.queryStringParameters.event === undefined) {
        return errorResponse("event parameter with event id missing")
    }
    let eventId = event.queryStringParameters.event;
    let retrievedEvent = await getEvent(eventId);
    let userFullName = await getUserFullName(username);
    let attendeesOfEvent = await getEventAttendees(eventId);

    let templateData = {
        name: userFullName,
        eventName: retrievedEvent.name,
        attendees: attendeesOfEvent,
    }

    let params = {
        "Source": "miguel.navjor@gmail.com",
        "Template": "eventSumUpTemplate",
        "ConfigurationSetName": "Sentinel-ses-configuration-set",
        "Destination": {
            "ToAddresses": [username]
        },
        "TemplateData": JSON.stringify(templateData),
    }

    await ses.sendTemplatedEmail(params).promise().then((res) => {
        console.log(res);
    });
    return returnOkResponse();
};

function returnOkResponse() {
    return {
        statusCode: 200,
        body: JSON.stringify({
            Message: "Email Sent"
        })
    };
}

function errorResponse(message) {
    return {
        statusCode: 400,
        body: JSON.stringify({
            Error: message,
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

function getItem(params) {
    return new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}