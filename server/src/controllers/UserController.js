const bcrypt = require('bcryptjs');
const db = require('../config/db');
const userQueries = require('../db/queries/userQueries');

const userController = {
  // @route   POST /api/users
  // @desc    Admin adds a new user (Manager, Finance, Director, Employee)
  addUser: async (req, res) => {
    const { name, email, password, role, managerId } = req.body;
    const adminCompanyId = req.user.companyId;

    try {
      // 1. Check if user already exists
      const userCheck = await db.query(userQueries.findByEmail, [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // 2. Hash Password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Create User linked to Admin's company
      const result = await db.query(userQueries.createUser, [
        name,
        email,
        passwordHash,
        role,
        adminCompanyId,
        managerId || null
      ]);

      res.status(201).json({
        message: `${role} added successfully`,
        user: result.rows[0]
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error while adding user' });
    }
  },

  // @route   GET /api/users
  // @desc    Get all users in the same company
  getCompanyUsers: async (req, res) => {
    const companyId = req.user.companyId;

    try {
      const result = await db.query(userQueries.getAllUsersInCompany, [companyId]);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error fetching company users' });
    }
  },

  // @route   PATCH /api/users/:id/role
  // @desc    Admin updates a user's role
  updateRole: async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
      const result = await db.query(userQueries.updateUserRole, [role, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error updating role' });
    }
  },

  // @route   DELETE /api/users/:id
  // @desc    Admin deletes a user
  deleteUser: async (req, res) => {
    const { id } = req.params;
    const companyId = req.user.companyId;

    try {
      const result = await db.query(userQueries.deleteUser, [id, companyId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found or not in your company' });
      }
      res.json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error deleting user' });
    }
  }
};

module.exports = userController;
