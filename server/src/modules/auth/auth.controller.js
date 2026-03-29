const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../../config/db');
const userQueries = require('../../db/queries/userQueries');
const currencyService = require('../../services/currencyService');
const emailService = require('../../services/emailService');

// Helper: generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const authController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, companyName, country } = req.body;

    try {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        const userCheck = await client.query(userQueries.findByEmail, [email]);
        if (userCheck.rows.length > 0) {
          throw new Error('User already exists');
        }

        const companyCheck = await client.query(userQueries.findCompanyByName, [companyName]);
        if (companyCheck.rows.length > 0) {
          throw new Error('Company already exists');
        }

        const defaultCurrency = await currencyService.getCurrencyByCountry(country);

        const companyResult = await client.query(userQueries.createCompany, [companyName, defaultCurrency, country]);
        const companyId = companyResult.rows[0].id;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userResult = await client.query(userQueries.createUser, [
          name, email, passwordHash, 'ADMIN', companyId, null
        ]);

        await client.query('COMMIT');

        const user = userResult.rows[0];
        
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
      const result = await db.query(userQueries.findByEmail, [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

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
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD — Step 1: Request OTP
  // ═══════════════════════════════════════════════════════════════════════════
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
      const userResult = await db.query(userQueries.findByEmail, [email]);
      if (userResult.rows.length === 0) {
        // Don't reveal if email exists — always return success
        return res.json({ message: 'If an account exists, an OTP has been sent.' });
      }

      const user = userResult.rows[0];
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Upsert OTP record
      await db.query(`
        INSERT INTO password_resets (email, otp, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3, used = false
      `, [email, otp, expiresAt]);

      // Send email
      await emailService.sendPasswordResetOTP(user, otp);

      res.json({ message: 'If an account exists, an OTP has been sent.' });
    } catch (err) {
      console.error('Forgot password error:', err.message);
      res.status(500).json({ message: 'Server error processing request' });
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD — Step 2: Verify OTP
  // ═══════════════════════════════════════════════════════════════════════════
  verifyResetOTP: async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    try {
      const result = await db.query(`
        SELECT * FROM password_resets 
        WHERE email = $1 AND otp = $2 AND used = false AND expires_at > NOW()
      `, [email, otp]);

      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Generate a short-lived reset token
      const resetToken = jwt.sign(
        { email, purpose: 'password_reset' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '10m' }
      );

      // Mark OTP as used
      await db.query(`UPDATE password_resets SET used = true WHERE email = $1`, [email]);

      res.json({ message: 'OTP verified successfully', resetToken });
    } catch (err) {
      console.error('Verify OTP error:', err.message);
      res.status(500).json({ message: 'Server error verifying OTP' });
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD — Step 3: Reset Password
  // ═══════════════════════════════════════════════════════════════════════════
  resetPassword: async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback_secret');
      if (decoded.purpose !== 'password_reset') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }

      const userResult = await db.query(userQueries.findByEmail, [decoded.email]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await db.query(userQueries.updatePassword, [passwordHash, userResult.rows[0].id]);

      res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Reset token has expired. Please request a new OTP.' });
      }
      console.error('Reset password error:', err.message);
      res.status(500).json({ message: 'Server error resetting password' });
    }
  }
};

module.exports = authController;
