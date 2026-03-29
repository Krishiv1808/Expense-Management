const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// @route   POST api/users/create
// @desc    Admin creates a new user (employee)
// @access  Private (Admin only)
router.post('/create', verifyToken, isAdmin, userController.createUser);

module.exports = router;
