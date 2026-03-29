const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

// @route   POST api/users/create
// @desc    Admin creates a new user (employee)
// @access  Private (Admin only)
router.post('/create', verifyToken, isAdmin, userController.createUser);

// @route   GET api/users
// @desc    Admin lists all users in the company
// @access  Private (Admin only)
router.get('/', verifyToken, isAdmin, userController.getUsers);

// @route   PUT api/users/password
// @desc    Change logged-in user password
// @access  Private (Any authenticated user)
router.put('/password', verifyToken, userController.changePassword);

module.exports = router;
