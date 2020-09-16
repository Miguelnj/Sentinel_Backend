const AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition();

exports.handler = async (event) => {
    const fileName = (event.Records[0].s3.object.key).replace('%40', '@');
    const username = fileName.substring(0, fileName.indexOf('.jpg')).replace('@','___');
    await addImageToCollection(username, fileName).then(data => console.log(data));
};

async function addImageToCollection(pictureId, s3Filename) {
    let params = {
        CollectionId: 'assistance-check',
        ExternalImageId: pictureId,
        Image: {
            S3Object: {
                Bucket: 'assistance-check-index-faces',
                Name: s3Filename
            }
        }
    }
    await rekognition.indexFaces(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    }).promise();
}