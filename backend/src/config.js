// Central config loader.
//
// Locally, values come from process.env (populated via dotenv from .env).
// In production, set SECRETS_MANAGER_SECRET_NAME to the name/ARN of a
// Secrets Manager secret holding a JSON object with keys DB_HOST, DB_USER,
// DB_PASSWORD, DB_NAME, S3_BUCKET_NAME, AWS_REGION — those values override
// their .env equivalents. Every other module only ever imports `config`
// from here, so nothing else needs to change when switching modes.
require('dotenv').config();
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

function loadFromEnv() {
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

const config = loadFromEnv();
let loaded = false;

// Must be awaited once at startup (see server.js) before any module that
// reads config values at require-time (db.js, s3.js) is required.
async function ensureLoaded() {
  if (loaded) return config;

  const secretName = process.env.SECRETS_MANAGER_SECRET_NAME;
  if (secretName) {
    const client = new SecretsManagerClient({ region: config.aws.region });
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
    const secrets = JSON.parse(response.SecretString);

    config.db.host = secrets.DB_HOST ?? config.db.host;
    config.db.user = secrets.DB_USER ?? config.db.user;
    config.db.password = secrets.DB_PASSWORD ?? config.db.password;
    config.db.name = secrets.DB_NAME ?? config.db.name;
    config.s3.bucketName = secrets.S3_BUCKET_NAME ?? config.s3.bucketName;
    config.aws.region = secrets.AWS_REGION ?? config.aws.region;
  }

  const required = [
    ['DB_HOST', config.db.host],
    ['DB_USER', config.db.user],
    ['DB_NAME', config.db.name],
    ['AWS_REGION', config.aws.region],
    ['S3_BUCKET_NAME', config.s3.bucketName],
  ];
  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  loaded = true;
  return config;
}

config.ensureLoaded = ensureLoaded;

module.exports = config;
