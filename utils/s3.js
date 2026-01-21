const AWS = require("aws-sdk");


const s3 = new AWS.S3({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, region: process.env.AWS_REGION, });

exports.uploadToS3 = async (data, fileKey) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileKey,
        Body: data,
        ContentType: "text/csv",
    };

    await s3.upload(params).promise();

    // Generate signed URL (valid for 5 minutes)
    const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.BUCKET_NAME,
        Key: fileKey,
        Expires: 300, // seconds
    });

    return signedUrl;
};
