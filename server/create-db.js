const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'src', '.env') });

const createDB = async () => {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' // Connect to default DB first to create new DB
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
    const newClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
      database: 'expense_mgmt'
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
