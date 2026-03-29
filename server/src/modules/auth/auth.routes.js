const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const currencyService = require('../../services/currencyService');
const { registerValidation, loginValidation } = require('./auth.validation');

// @route   POST api/auth/register
// @desc    Register a new company and admin user
router.post('/register', registerValidation, authController.register);

// @route   POST api/auth/login
// @desc    Log in a user
router.post('/login', loginValidation, authController.login);

// @route   GET api/auth/countries
// @desc    Fetch all countries for the signup dropdown
router.get('/countries', async (req, res) => {
    try {
        const countries = await currencyService.getAllCountries();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching countries' });
    }
});

module.exports = router;
