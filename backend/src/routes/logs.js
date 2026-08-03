const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { pool } = require('../db');
const { uploadImage, deleteImage, getSignedImageUrl } = require('../s3');

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG images are allowed'));
    }
    cb(null, true);
  },
});

// POST /api/logs
router.post('/', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      const status = err.message.includes('File too large') ? 400 : 400;
      return res.status(status).json({ error: err.message });
    }

    try {
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const ext = path.extname(req.file.originalname) || '.jpg';
      const imageKey = `${uuidv4()}${ext}`;

      await uploadImage(imageKey, req.file.buffer, req.file.mimetype);

      const [result] = await pool.query(
        'INSERT INTO deployment_logs (message, image_key) VALUES (?, ?)',
        [message.trim(), imageKey]
      );

      const [rows] = await pool.query(
        'SELECT id, message, image_key, created_at FROM deployment_logs WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating deployment log:', error);
      res.status(500).json({ error: 'Failed to create deployment log' });
    }
  });
});

// GET /api/logs
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, message, image_key, created_at FROM deployment_logs ORDER BY created_at DESC'
    );

    const logs = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        message: row.message,
        image_url: await getSignedImageUrl(row.image_key),
        created_at: row.created_at,
      }))
    );

    res.json(logs);
  } catch (error) {
    console.error('Error fetching deployment logs:', error);
    res.status(500).json({ error: 'Failed to fetch deployment logs' });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT image_key FROM deployment_logs WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Deployment log not found' });
    }

    await deleteImage(rows[0].image_key);
    await pool.query('DELETE FROM deployment_logs WHERE id = ?', [id]);

    res.json({ success: true, message: 'Deployment log deleted' });
  } catch (error) {
    console.error('Error deleting deployment log:', error);
    res.status(500).json({ error: 'Failed to delete deployment log' });
  }
});

module.exports = router;
