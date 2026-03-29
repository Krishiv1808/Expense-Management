const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const host = process.env.LOCAL_DB_HOST || process.env.CLOUD_DB_HOST;

const createDB = async () => {
  const client = new Client({
    user: process.env.LOCAL_DB_USER || process.env.CLOUD_DB_USER,
    host: host,
    password: process.env.LOCAL_DB_PASSWORD || process.env.CLOUD_DB_PASSWORD,
    port: process.env.LOCAL_DB_PORT || process.env.CLOUD_DB_PORT,
    database: 'postgres', // Connect to default DB first to create new DB
    ssl: (host && host !== 'localhost') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    // Check if db exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'expense_mgmt';`);
    if (res.rowCount === 0) {
      console.log('Database does not exist, creating...');
      await client.query(`CREATE DATABASE expense_mgmt;`);
      console.log('Database expense_mgmt created successfully.');
    } else {
      console.log('Database expense_mgmt already exists.');
    }
    
    await client.end();

    // Now connect to the new DB and run schema
    const dbName = process.env.LOCAL_DB_NAME || process.env.CLOUD_DB_NAME;
    const newClient = new Client({
      user: process.env.LOCAL_DB_USER || process.env.CLOUD_DB_USER,
      host: host,
      password: process.env.LOCAL_DB_PASSWORD || process.env.CLOUD_DB_PASSWORD,
      port: process.env.LOCAL_DB_PORT || process.env.CLOUD_DB_PORT,
      database: dbName,
      ssl: (host && host !== 'localhost') ? { rejectUnauthorized: false } : false
    });

    await newClient.connect();
    console.log('Connected to expense_mgmt database.');
    
    const schemaSql = fs.readFileSync(path.join(__dirname, 'src', 'db', 'schema.sql')).toString();
    await newClient.query(schemaSql);
    console.log('Schema initialized successfully.');
    
    await newClient.end();
  } catch (err) {
    console.error('Error in DB initialization:', err);
  }
};

createDB();
