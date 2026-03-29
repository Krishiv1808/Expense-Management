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
      const userRole = req.user.role;
      const userId = req.user.id;
      
      const result = await db.query(expenseQueries.getPendingExpensesWithApprovals, [companyId]);
      const now = new Date();

      const visibleClaims = result.rows.filter(claim => {
        // Exclude claims the user has already acted upon
        const userAction = claim.approvals.find(a => a.user_id === userId);
        if (userAction) return false;

        const hrPending = (now.getTime() - new Date(claim.created_at).getTime()) / (1000 * 60 * 60);

        if (userRole === 'ADMIN') return true;
        if (userRole === 'MANAGER') return true; // Managers form the baseline review tier
        if (userRole === 'FINANCE') {
           // Escalate if >24h OR if the Manager already approved it
           return (hrPending >= 24) || claim.approvals.some(a => a.role === 'MANAGER');
        }
        if (userRole === 'DIRECTOR') {
           // Escalate if >48h OR if it bypassed/cleared Finance
           return (hrPending >= 48) || claim.approvals.some(a => a.role === 'FINANCE');
        }
        return false;
      });

      res.json(visibleClaims);
    } catch (err) {
      console.error('Error fetching pending claims:', err);
      res.status(500).json({ message: 'Server error fetching pending claims' });
    }
  },

  getApprovedClaims: async (req, res) => {
    try {
      const companyId = req.user.companyId;
      const result = await db.query(expenseQueries.getApprovedExpensesByCompany, [companyId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching approved claims:', err);
      res.status(500).json({ message: 'Server error fetching approved claims' });
    }
  },

  updateClaimStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
      }

      // Check if expense exists and is still pending
      const checkQuery = `SELECT * FROM expenses WHERE id = $1 AND company_id = $2`;
      const checkResult = await db.query(checkQuery, [id, companyId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Expense claim not found or you lack permission' });
      }
      
      const expense = checkResult.rows[0];
      if (expense.status !== 'PENDING') {
         return res.status(400).json({ message: 'Expense already finalized' });
      }

      // Logic Rule 1: Instant Rejection Kills the Claim
      if (status === 'REJECTED') {
         await db.query(expenseQueries.recordApprovalAction, [id, userId, 'REJECTED']);
         const finalResult = await db.query(expenseQueries.updateExpenseStatus, ['REJECTED', id, companyId]);
         return res.json({ message: 'Expense claim rejected per instant-kill protocol', expense: finalResult.rows[0] });
      }

      // Logic Rule 2: Record Approval
      await db.query(expenseQueries.recordApprovalAction, [id, userId, 'APPROVED']);

      // Logic Rule 3: Executive Override
      if (userRole === 'DIRECTOR' || userRole === 'ADMIN') {
         const autoApprove = await db.query(expenseQueries.updateExpenseStatus, ['APPROVED', id, companyId]);
         return res.json({ message: 'Executive Override: Claim unconditionally approved', expense: autoApprove.rows[0] });
      }

      // Logic Rule 4: Mandatory Roles Consensus (Manager AND Finance)
      const roleQuery = `
        SELECT u.role 
        FROM approval_actions a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.expense_id = $1 AND a.status = 'APPROVED'
      `;
      const roleResult = await db.query(roleQuery, [id]);
      const approvedRoles = roleResult.rows.map(r => r.role);

      const hasManager = approvedRoles.includes('MANAGER');
      const hasFinance = approvedRoles.includes('FINANCE');

      if (hasManager && hasFinance) {
         const majorityApprove = await db.query(expenseQueries.updateExpenseStatus, ['APPROVED', id, companyId]);
         return res.json({ message: 'Manager & Finance Consensus Reached: Claim officially finalized', expense: majorityApprove.rows[0] });
      }

      // Still pending threshold
      return res.json({ message: 'Approval recorded. Escalinating for additional consensus.', expense });
    } catch (err) {
      console.error('Error updating claim status:', err);
      res.status(500).json({ message: 'Server error updating claim status' });
    }
  }
};

module.exports = expenseController;
