const { Pool } = require('pg');
require('dotenv').config();

const host = process.env.LOCAL_DB_HOST || process.env.CLOUD_DB_HOST;

const pool = new Pool({
  user: process.env.LOCAL_DB_USER || process.env.CLOUD_DB_USER,
  host: host,
  database: process.env.LOCAL_DB_NAME || process.env.CLOUD_DB_NAME,
  password: process.env.LOCAL_DB_PASSWORD || process.env.CLOUD_DB_PASSWORD,
  port: process.env.LOCAL_DB_PORT || process.env.CLOUD_DB_PORT,
  // Added SSL support for Cloud DBs (Supabase/Neon)
  ssl: (host && host !== 'localhost') ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
