const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const host = process.env.LOCAL_DB_HOST || process.env.CLOUD_DB_HOST;

const migrate = async () => {
  const client = new Client({
    user: process.env.LOCAL_DB_USER || process.env.CLOUD_DB_USER,
    host: host,
    password: process.env.LOCAL_DB_PASSWORD || process.env.CLOUD_DB_PASSWORD,
    port: process.env.LOCAL_DB_PORT || process.env.CLOUD_DB_PORT,
    database: process.env.LOCAL_DB_NAME || process.env.CLOUD_DB_NAME,
    ssl: (host && host !== 'localhost') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database. Running migrations...\n');

    // Migration 1: Add updated_at to expenses
    await client.query(`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ Migration 1: updated_at column added to expenses table');

    // Backfill existing rows
    const { rowCount } = await client.query(`
      UPDATE expenses SET updated_at = created_at WHERE updated_at IS NULL;
    `);
    console.log(`✅ Backfill: updated ${rowCount} existing rows`);

    // Migration 2: Create password_resets table
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Migration 2: password_resets table created');

    console.log('\n🎉 All migrations completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
};

migrate();
