const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('./config');

const clientOptions = { region: config.aws.region };

// If explicit keys are provided use them; otherwise the SDK falls back to
// the default credential provider chain (IAM role, shared config, etc).
if (config.aws.accessKeyId && config.aws.secretAccessKey) {
  clientOptions.credentials = {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  };
}

const s3Client = new S3Client(clientOptions);

async function uploadImage(key, buffer, contentType) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

async function deleteImage(key) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
    })
  );
}

async function getSignedImageUrl(key, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

module.exports = { uploadImage, deleteImage, getSignedImageUrl };
