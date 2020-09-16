const AWS = require('aws-sdk');
const {"v4": uuidv4} = require('uuid');
const docClient = new AWS.DynamoDB.DocumentClient();

async function getCreatedItem(uuid) {
    let params = {
        Key: {
            "uuid" : uuid,
        },
        TableName: "qr_codes"
    };
    return await getItem(params);
}

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    if (body !== undefined && body.event_id !== undefined) {
        let expirationTimestamp = Math.floor(Date.now() / 1000) + 5;
        let uuid = uuidv4();
        let params = {
            Item: {
                uuid: uuid,
                event_id: body.event_id,
                expirationTimestamp: expirationTimestamp,
            },
            TableName: "qr_codes"
        };
        await putItem(params);
        let data = await getCreatedItem(uuid);
        if (data.hasOwnProperty("Item")) return returnOkResponse(data.Item);
        return errorResponse();
    } else errorResponse()
};

function getItem(params) {
    return new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function putItem(params) {
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
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
        statusCode: 201,
        body: JSON.stringify(data)
    };
}
