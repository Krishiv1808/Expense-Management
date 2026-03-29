const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedClaims() {
  const client = await pool.connect();
  try {
    console.log('Connecting to database...');
    
    // Find an employee to assign claims to
    const resUser = await client.query("SELECT id, company_id FROM users WHERE role = 'EMPLOYEE' LIMIT 1");
    if (resUser.rows.length === 0) {
      console.log('Error: No users with role EMPLOYEE found. Please create an employee first.');
      return;
    }
    
    const { id: employeeId, company_id: companyId } = resUser.rows[0];
    console.log(`Using Employee ID: ${employeeId} from Company: ${companyId}`);

    const claims = [
      {
        amount: 85.50,
        currency: 'USD',
        category: 'Travel',
        description: 'Uber to Airport (Recent - Normal Queue)',
        date: new Date().toISOString().split('T')[0],
        createdOffset: "INTERVAL '5 hours'" // Needs 0-24h (Manager)
      },
      {
        amount: 1400.00,
        currency: 'USD',
        category: 'Equipment',
        description: 'New Engineering Laptop (Sluggish - Fast Approaching Escalation)',
        date: new Date().toISOString().split('T')[0],
        createdOffset: "INTERVAL '18 hours'" // Needs > 16h warning
      },
      {
        amount: 320.75,
        currency: 'USD',
        category: 'Meals',
        description: 'Client Dinner with Acme Corp (Escalated to Finance)',
        date: new Date().toISOString().split('T')[0],
        createdOffset: "INTERVAL '26 hours'" // Escalated to Finance (24-48h)
      },
      {
        amount: 12500.00,
        currency: 'USD',
        category: 'Conference',
        description: 'Gartner Symposium Sponsorship Booth (Executive Escelation)',
        date: new Date().toISOString().split('T')[0],
        createdOffset: "INTERVAL '54 hours'" // Escalated to Director (48h+)
      }
    ];

    for (const claim of claims) {
      const q = `
        INSERT INTO expenses (employee_id, company_id, amount, currency, category, description, date, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', NOW() - ${claim.createdOffset})
        RETURNING id;
      `;
      const res = await client.query(q, [
        employeeId, companyId, claim.amount, claim.currency, claim.category, claim.description, claim.date
      ]);
      console.log(`Inserted claim ID ${res.rows[0].id} with offset ${claim.createdOffset}`);
    }

    console.log('Seeding completed successfully!');
    
  } catch (err) {
    console.error('Error seeding claims:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedClaims();
