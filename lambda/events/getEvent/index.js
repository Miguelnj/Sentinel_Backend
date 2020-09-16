const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function getEventAttendees(Item) {
    let params = {
        TableName: "attendees_events",
        KeyConditionExpression: "#event_id = :event_id",
        ExpressionAttributeNames:{
            "#event_id": "event_id"
        },
        ExpressionAttributeValues: {
            ":event_id": Item.id,
        }
    }

    let response = await query(params);
    let attendees = {};
    if(response.Items.length > 0){
        for(let j = 0; j < response.Items.length; j++){
            attendees[response.Items[j].user_id] = response.Items[j].hasAttended;
        }
    }
    return attendees;
}

exports.handler = async (event) => {
    console.log(event);
    if(event.pathParameters != null){
        let identifier = event.pathParameters.identifier;
        let params = {
            TableName: "events",
            Key:{
                id: identifier
            }
        };
        let data = await getItem(params);
        if(data.Item === undefined) return noDataFoundResponse();
        data.Item.attendees = await getEventAttendees(data.Item);
        return returnOkResponse(data);
    }else{
        return errorResponse();
    }
};


function getItem(params){
    return new Promise((resolve, reject) => {
        docClient.get(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function query(params){
    return new Promise((resolve, reject) => {
        docClient.query(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
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
