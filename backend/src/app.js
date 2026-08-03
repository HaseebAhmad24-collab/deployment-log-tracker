const express = require('express');
const cors = require('cors');
const config = require('./config');
const logsRouter = require('./routes/logs');

const app = express();

app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/logs', logsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler (catches multer/other sync errors not already handled in routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
