const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

exports.uploadToS3 = async (data, fileName) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: data,
        ContentType: "text/csv",
    };

    const result = await s3.upload(params).promise();
    return result.Location;
};
