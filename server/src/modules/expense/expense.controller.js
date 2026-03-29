const db = require('../../config/db');
const expenseQueries = require('../../db/queries/expenseQueries');
const ocrService = require('../../services/ocrService');

const expenseController = {
  createClaim: async (req, res) => {
    try {
      let { amount, currency, category, description, date } = req.body;
      const employeeId = req.user.id;
      const companyId = req.user.companyId;
      
      let receiptUrl = null;
      let ocrMetadata = null;

      if (req.file) {
        // 1. Store the URL
        receiptUrl = `/uploads/${req.file.filename}`;
        
        // 2. Perform OCR (Scanning the physical on-disk file path)
        try {
          ocrMetadata = await ocrService.processReceipt(req.file.path);
          
          // Auto-fill missing data if OCR found it
          if (!amount && ocrMetadata.amount) {
            amount = ocrMetadata.amount;
          }
          if (!date && ocrMetadata.date) {
            try {
              date = new Date(ocrMetadata.date).toISOString().split('T')[0];
            } catch(e) {}
          }
          if (ocrMetadata.merchant) {
            description = description 
              ? `${description} (OCR Merchant: ${ocrMetadata.merchant})` 
              : `Merchant: ${ocrMetadata.merchant}`;
          }
        } catch (ocrErr) {
          console.error('⚠️ OCR Warning (Processing continued without scan):', ocrErr.message);
        }
      }

      if (!amount || !currency || !date) {
        return res.status(400).json({ message: 'Amount, currency, and date are required' });
      }

      const result = await db.query(expenseQueries.createExpense, [
        employeeId,
        companyId,
        amount,
        currency,
        category || 'Uncategorized',
        description || '',
        date,
        receiptUrl
      ]);

      res.status(201).json({
        message: 'Expense claim submitted successfully',
        expense: result.rows[0],
        ocr: ocrMetadata // Provide feedback to the client
      });
    } catch (err) {
      console.error('Error creating claim:', err);
      res.status(500).json({ message: 'Server error creating claim' });
    }
  },

  getMyClaims: async (req, res) => {
    try {
      const employeeId = req.user.id;
      const result = await db.query(expenseQueries.getExpensesByEmployee, [employeeId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching claims:', err);
      res.status(500).json({ message: 'Server error fetching claims' });
    }
  },

  getPendingClaims: async (req, res) => {
    try {
      const companyId = req.user.companyId;
      // Note: Only FINANCE or ADMIN should theoretically access this, enforced by middleware
      const result = await db.query(expenseQueries.getPendingExpensesByCompany, [companyId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching pending claims:', err);
      res.status(500).json({ message: 'Server error fetching pending claims' });
    }
  },

  updateClaimStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.user.companyId;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
      }

      // Ensure the claim belongs to the same company
      const result = await db.query(expenseQueries.updateExpenseStatus, [status, id, companyId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Expense claim not found or you lack permission' });
      }

      res.json({
        message: `Expense claim ${status.toLowerCase()} successfully`,
        expense: result.rows[0]
      });
    } catch (err) {
      console.error('Error updating claim status:', err);
      res.status(500).json({ message: 'Server error updating claim status' });
    }
  }
};

module.exports = expenseController;
