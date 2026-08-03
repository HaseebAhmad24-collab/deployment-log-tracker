const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS deployment_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message VARCHAR(255) NOT NULL,
      image_key VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = { pool, initSchema };
