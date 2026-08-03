const config = require('./config');

async function start() {
  try {
    await config.ensureLoaded();

    // Required only after config is fully resolved — db.js and s3.js build
    // their connection pool/client from config values at require-time.
    const app = require('./app');
    const { initSchema } = require('./db');

    await initSchema();
    app.listen(config.server.port, () => {
      console.log(`Deployment Log Tracker API listening on port ${config.server.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
