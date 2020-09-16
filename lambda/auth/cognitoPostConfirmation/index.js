const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

    let name = event.request.userAttributes.name;
    let family_name = event.request.userAttributes.family_name;
    let email = event.request.userAttributes.email;
    if(name === undefined) name = "Unknown";
    if(family_name === undefined) family_name = "Unknown";
    if(email === undefined) email = "Unknown";
    let params = {
        Item: {
            name: name,
            surnames: family_name,
            username: email,
            ownedEvents: [],
            attendEvents: []
        },
        TableName: "users",
        ConditionExpression: "attribute_not_exists(username)"
    };
    await putItem(params);
    context.done(null,event);
};

function putItem(params){
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err){
                console.log(err);
                if(err.code === 'ConditionalCheckFailedException') resolve(400);
                reject(err);
            }
            else resolve(data);
        });
    });
}
