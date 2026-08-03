const app = require('./app');
const config = require('./config');
const { initSchema } = require('./db');

async function start() {
  try {
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
