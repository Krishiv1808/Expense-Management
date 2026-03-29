const express = require('express');
const router = express.Router();
const expenseController = require('./expense.controller');
const { verifyToken } = require('../auth/auth.middleware');
const upload = require('../../middleware/upload');

// Middleware to check if user is FINANCE or ADMIN
const isFinanceOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'FINANCE' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Requires FINANCE or ADMIN role' });
  }
};

// @route   POST api/expenses
// @desc    Employee submits a new expense claim
// @access  Private
router.post('/', verifyToken, upload.single('receipt'), expenseController.createClaim);

// @route   GET api/expenses/me
// @desc    Employee gets their own claims
// @access  Private
router.get('/me', verifyToken, expenseController.getMyClaims);

// @route   GET api/expenses/pending
// @desc    Finance gets all pending claims for the company
// @access  Private (Finance/Admin only)
router.get('/pending', verifyToken, isFinanceOrAdmin, expenseController.getPendingClaims);

// @route   PATCH api/expenses/:id/status
// @desc    Finance approves or rejects a claim
// @access  Private (Finance/Admin only)
router.patch('/:id/status', verifyToken, isFinanceOrAdmin, expenseController.updateClaimStatus);

module.exports = router;
