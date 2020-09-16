const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    //Parameters coming in the body of the vent should be only the ones that need to be updated
    //Or it's better to send all the attributes, compare them and update the ones needed...?

    if(event.pathParameters != null && event.body !== undefined ){
        let identifier = event.pathParameters.identifier;
        let body = JSON.parse(sanitize(event.body));
        let params = buildParams(body, identifier);
        console.log(params);
        let updatedItem = await updateItem(params);
        return returnOkResponse(updatedItem);
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
            if (attribute === "id") continue;
            updateExpression += "#" + attribute + " = :" + attribute + " ,";
            expressionAttributeValues[":" + attribute] = body[attribute];
            expressionAttributeNames["#" + attribute] = attribute;
        }
    }
    updateExpression = updateExpression.substring(0, updateExpression.length - 2);

    return {
        TableName: "events",
        Key: {
            "id": identifier
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW"
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

function returnOkResponse(updatedItem) {
    let item = JSON.stringify(updatedItem);
    console.log(item);
    return {
        statusCode: 200,
        body: JSON.stringify({
            Message: "Item successfully updated if exists",
            object: updatedItem
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