const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    if(event.pathParameters != null && event.body !== undefined ){
        let identifier = event.pathParameters.identifier;
        let body = JSON.parse(sanitize(event.body));
        let params = buildParams(body, identifier);

        await updateItem(params);
        return returnOkResponse();
    }else{
        return errorResponse();
    }
};

function buildParams(body, identifier) {
    let updateExpression = "set ";
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};
    for (let attribute in body) {
        if (body.hasOwnProperty(attribute)) {
            if (attribute === "username") continue;
            updateExpression += "#" + attribute + " = :" + attribute + " ,";
            expressionAttributeValues[":" + attribute] = body[attribute];
            expressionAttributeNames["#" + attribute] = attribute;
        }
    }
    updateExpression = updateExpression.substring(0, updateExpression.length - 2);

    return {
        TableName: "users",
        Key: {
            "username": identifier
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames
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
            Message: "Item successfully updated if exists"
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