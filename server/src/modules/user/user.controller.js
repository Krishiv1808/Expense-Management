const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const userQueries = require('../../db/queries/userQueries');

const userController = {
  createUser: async (req, res) => {
    // Only admins should access this, guaranteed by middleware
    const { name, email, password, role } = req.body;
    const adminUser = req.user;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    try {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // Check if user already exists
        const userCheck = await client.query(userQueries.findByEmail, [email]);
        if (userCheck.rows.length > 0) {
          throw new Error('User with this email already exists');
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // All users created here belong to the admin's company
        const companyId = adminUser.companyId;

        const userResult = await client.query(userQueries.createUser, [
          name,
          email,
          passwordHash,
          role,
          companyId,
          adminUser.id // Setting manager_id to the admin for simplicity, can be updated later
        ]);

        await client.query('COMMIT');

        const newUser = userResult.rows[0];

        res.status(201).json({
          message: 'User created successfully',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            companyId: newUser.company_id
          }
        });
      } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: err.message });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ message: 'Server error creating user' });
    }
  },

  getUsers: async (req, res) => {
    try {
      const companyId = req.user.companyId;
      const result = await db.query(userQueries.getAllUsersInCompany, [companyId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ message: 'Server error fetching users' });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    try {
      // 1. Fetch user to verify old password (need the hash)
      // userQueries.getUserById doesn't return password_hash. Let's do a direct query.
      const userRes = await db.query(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
      if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
      
      const user = userRes.rows[0];

      // 2. Compare passwords
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      // 3. Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // 4. Update password
      await db.query(userQueries.updatePassword, [newPasswordHash, userId]);

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({ message: 'Server error changing password' });
    }
  }
};

module.exports = userController;
