const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

function checkIfRequestIsValid(expirationTimestamp, clientTimestamp) {
    return expirationTimestamp >= clientTimestamp;
}

async function getQrRegister(uuid) {
    let params = {
        TableName: "qr_codes",
        Key: {
            "uuid": uuid
        }
    };
    let item = await getItem(params);
    if (item.hasOwnProperty("Item")) return item.Item;
    else return null;
}

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    if (body !== undefined && body.uuid !== undefined && body.timestamp !== undefined) {
        let username = event.requestContext.authorizer.claims.email;
        let qrRegister = await getQrRegister(body.uuid);
        if(qrRegister === null) return errorResponse("Invalid QR identifier");
        if (!checkIfRequestIsValid(qrRegister.expirationTimestamp, body.timestamp)) return errorResponse("Invalid timestamp");
        let params = {
            Item: {
                event_id: qrRegister.event_id,
                user_id: username,
                hasAttended: true,
                createdAt: new Date().toISOString(),
            },
            TableName: "attendees_events"
        };
        await putItem(params);
        return returnOkResponse();
    } else return errorResponse();
};

function putItem(params) {
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
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

function errorResponse(errorString) {
    return {
        statusCode: 400,
        body: JSON.stringify({
            Error: errorString,
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
            Message: "User confirmed in event if exists"
        })
    };
}
