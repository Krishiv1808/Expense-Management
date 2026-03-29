const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/users
// @desc    Admin adds a new user (Manager, Finance, Director, Employee)
router.post('/', authMiddleware, isAdmin, userController.addUser);

// @route   GET /api/users
// @desc    Get all users in the same company
router.get('/', authMiddleware, userController.getCompanyUsers);

// @route   PATCH /api/users/:id/role
// @desc    Admin updates a user's role
router.patch('/:id/role', authMiddleware, isAdmin, userController.updateRole);

module.exports = router;
