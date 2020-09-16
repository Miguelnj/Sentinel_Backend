const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let username = event.requestContext.authorizer.claims.email;
    let params = {
        TableName : "events",
        IndexName : "owner-index",
        KeyConditionExpression: "#owner = :username",
        ExpressionAttributeNames:{
            "#owner": "owner"
        },
        ExpressionAttributeValues: {
            ":username": username
        }
    };
    let data = await query(params);
    if(data.Items.length === 0) return noDataFoundResponse();
    for(let i = 0; i < data.Items.length;i++){
        params = {
            TableName: "attendees_events",
            KeyConditionExpression: "#event_id = :event_id",
            ExpressionAttributeNames:{
                "#event_id": "event_id"
            },
            ExpressionAttributeValues: {
                ":event_id": data.Items[i].id,
            }
        }

        let response = await query(params);
        let attendees = {};
        if(response.Items.length > 0){
            for(let j = 0; j < response.Items.length; j++){
                attendees[response.Items[j].user_id] = response.Items[j].hasAttended;
            }
        }
        data.Items[i].attendees = attendees;
    }
    return returnOkResponse(data);
};

function query(params){
    return new Promise((resolve, reject) => {
        docClient.query(params, function(err, data) {
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

