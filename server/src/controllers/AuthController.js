const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const userQueries = require('../db/queries/userQueries');
const currencyService = require('../services/currencyService');

const authController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, companyName, country } = req.body;

    try {
      // 1. Start a transaction
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // 2. Check if user already exists
        const userCheck = await client.query(userQueries.findByEmail, [email]);
        if (userCheck.rows.length > 0) {
          throw new Error('User already exists');
        }

        // 2b. Check if company already exists
        const companyCheck = await client.query(userQueries.findCompanyByName, [companyName]);
        if (companyCheck.rows.length > 0) {
          throw new Error('Company already exists');
        }

        // 3. Resolve currency for the company
        const defaultCurrency = await currencyService.getCurrencyByCountry(country);

        // 4. Create Company (Admin is auto-created for this company)
        const companyResult = await client.query(userQueries.createCompany, [companyName, defaultCurrency, country]);
        const companyId = companyResult.rows[0].id;

        // 5. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 6. Create ADMIN User linked to company
        const userResult = await client.query(userQueries.createUser, [
          name, 
          email, 
          passwordHash, 
          'ADMIN', 
          companyId, 
          null // No manager for first admin
        ]);

        await client.query('COMMIT');

        const user = userResult.rows[0];
        
        // 7. Generate JWT
        const token = jwt.sign(
          { id: user.id, role: user.role, companyId: user.company_id },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Company and Admin created successfully',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
            currency: defaultCurrency
          }
        });

      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.message || 'Server error during registration' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Find user
      const result = await db.query(userQueries.findByEmail, [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // 3. Generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.company_id,
          companyName: user.company_name,
          currency: user.default_currency
        }
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
};

module.exports = authController;
