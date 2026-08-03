// Central config loader.
// Everything currently reads from process.env (populated via dotenv locally,
// or via real environment variables in production/PM2/systemd).
//
// To swap in AWS Secrets Manager later: replace the body of `loadSecrets()`
// with a call to Secrets Manager's GetSecretValue, merge the returned JSON
// into `secrets`, and leave every other file untouched — they only ever
// import `config` from this module.
require('dotenv').config();

function loadSecrets() {
  return {
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
    },
    aws: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    s3: {
      bucketName: process.env.S3_BUCKET_NAME,
    },
    server: {
      port: process.env.PORT || 5000,
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
  };
}

const config = loadSecrets();

const required = [
  ['DB_HOST', config.db.host],
  ['DB_USER', config.db.user],
  ['DB_NAME', config.db.name],
  ['AWS_REGION', config.aws.region],
  ['S3_BUCKET_NAME', config.s3.bucketName],
];

const missing = required.filter(([, value]) => !value).map(([key]) => key);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = config;
