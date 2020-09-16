const AWS = require('aws-sdk');

var rekognition = new AWS.Rekognition();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let fileName = event.Records[0].s3.object.key;
    console.log(fileName);
    await checkFace(fileName);
};

async function checkFace(s3Filename) {
    let params = {
        CollectionId: "assistance-check",
        Image: {
            S3Object: {
                Bucket: "assistance-check-images",
                Name: s3Filename
            }
        }
    };
    let response = await rekognition.searchFacesByImage(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data.FaceMatches[0]);
    }).promise();
    await saveDetectedUserInDB(response.FaceMatches[0], s3Filename)
}

async function saveDetectedUserInDB(faceMatch, s3Filename) {

    if (faceMatch === undefined) return;
    let detectedUser = faceMatch.Face.ExternalImageId;
    detectedUser = detectedUser.replace('___', '@');
    let eventId = s3Filename.substring(0, s3Filename.indexOf('.'));
    let params = {
        Item: {
            event_id: eventId,
            user_id: detectedUser,
            hasAttended: true,
            createdAt: new Date().toISOString(),
        },
        TableName: "attendees_events"
    };
    await putItem(params);
}

function putItem(params) {
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}