const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

function buildDeleteArray(response) {
    let deleteArray = [];
    if(response.Items.length > 0){
        for(let i = 0; i < response.Items.length; i++){
            let deleteRequest = {
                DeleteRequest : {
                    Key : {
                        'event_id' : response.Items[i].event_id,
                        'user_id' : response.Items[i].user_id
                    }
                }
            };
            deleteArray.push(deleteRequest);
        }
    }
    return deleteArray;
}

exports.handler = async (event) => {
    console.log(event);
    if(event.pathParameters != null){
        let identifier = event.pathParameters.identifier;
        let params = {
            TableName: "events",
            Key:{
                "id": identifier
            },
        };
        await deleteItem(params);
        //TODO DELETE ATTENDEES WITH EVENT = identifier
        params = {
            TableName : "attendees_events",
            KeyConditionExpression: "#event_id = :event_id",
            ExpressionAttributeNames:{
                "#event_id": "event_id"
            },
            ExpressionAttributeValues: {
                ":event_id": identifier
            }
        }
        let response = await query(params);
        let deleteArray = buildDeleteArray(response);
        if(deleteArray.length === 0) return returnOkResponse();
        params = {
            RequestItems : {
                'attendees_events' : deleteArray
            }
        }
        await batchDelete(params);
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

function query(params){
    return new Promise((resolve, reject) => {
        docClient.query(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function deleteItem(params){
    return new Promise((resolve, reject) => {
        docClient.delete(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function batchDelete(params){
    return new Promise((resolve, reject) => {
        docClient.batchWrite(params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}