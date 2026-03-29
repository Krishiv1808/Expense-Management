const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Initializing Database Schema...');
        await db.query(schemaSql);
        console.log('Database Initialized Successfully');
        
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err.message);
        process.exit(1);
    }
};

initDb();
