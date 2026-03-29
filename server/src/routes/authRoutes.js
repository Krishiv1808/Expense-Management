const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { registerValidation, loginValidation } = require('../middleware/authValidation');

// @route   POST api/auth/register
// @desc    Register a new company and admin user
router.post('/register', registerValidation, authController.register);

// @route   POST api/auth/login
// @desc    Log in a user
router.post('/login', loginValidation, authController.login);

module.exports = router;
