const express = require('express');
const router = express.Router();
const expenseController = require('./expense.controller');
const { verifyToken } = require('../auth/auth.middleware');
const upload = require('../../middleware/upload');

// Middleware to check if user is an Approver or Admin
const isApprover = (req, res, next) => {
  if (req.user && ['FINANCE', 'ADMIN', 'MANAGER', 'DIRECTOR'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Requires Approver Privileges' });
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
// @desc    Approvers get all pending claims for the company
// @access  Private (Finance/Admin/Manager/Director)
router.get('/pending', verifyToken, isApprover, expenseController.getPendingClaims);

// @route   GET api/expenses/approved
// @desc    Approvers get all finalized approved claims for the company
// @access  Private (Finance/Admin/Manager/Director)
router.get('/approved', verifyToken, isApprover, expenseController.getApprovedClaims);

// @route   PATCH api/expenses/:id/status
// @desc    Finance approves or rejects a claim
// @access  Private (Finance/Admin only)
router.patch('/:id/status', verifyToken, isApprover, expenseController.updateClaimStatus);

module.exports = router;
