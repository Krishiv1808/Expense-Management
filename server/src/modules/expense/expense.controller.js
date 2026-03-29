const db = require('../../config/db');
const expenseQueries = require('../../db/queries/expenseQueries');
const ocrService = require('../../services/ocrService');
const emailService = require('../../services/emailService');

// ─── Helper: fetch user row by ID ─────────────────────────────────────────
const getUserById = async (id) => {
  const r = await db.query('SELECT id, name, email, role, company_id FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
};

// ─── Helper: fetch users by role in a company ──────────────────────────────
const getUsersByRole = async (companyId, role) => {
  const r = await db.query('SELECT id, name, email, role FROM users WHERE company_id = $1 AND role = $2', [companyId, role]);
  return r.rows;
};

const expenseController = {
  createClaim: async (req, res) => {
    try {
      let { amount, currency, category, description, date } = req.body;
      const employeeId = req.user.id;
      const companyId = req.user.companyId;
      
      let receiptUrl = null;
      let ocrMetadata = null;

      if (req.file) {
        receiptUrl = `/uploads/${req.file.filename}`;
        try {
          ocrMetadata = await ocrService.processReceipt(req.file.path);
          if (!amount && ocrMetadata.amount) amount = ocrMetadata.amount;
          if (!date && ocrMetadata.date) {
            try { date = new Date(ocrMetadata.date).toISOString().split('T')[0]; } catch(e) {}
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
        employeeId, companyId, amount, currency,
        category || 'Uncategorized', description || '', date, receiptUrl
      ]);

      const expense = result.rows[0];

      // ═══ EMAIL #1: New Approval Request → All Managers ═══════════════════
      const employee = await getUserById(employeeId);
      const managers = await getUsersByRole(companyId, 'MANAGER');
      for (const mgr of managers) {
        emailService.newApprovalRequest(mgr, employee, expense).catch(e => console.error(e));
      }

      res.status(201).json({
        message: 'Expense claim submitted successfully',
        expense,
        ocr: ocrMetadata
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
        const userAction = claim.approvals.find(a => a.user_id === userId);
        if (userAction) return false;

        const hrPending = (now.getTime() - new Date(claim.created_at).getTime()) / (1000 * 60 * 60);

        if (userRole === 'ADMIN') return true;
        if (userRole === 'MANAGER') return true;
        if (userRole === 'FINANCE') {
           return (hrPending >= 24) || claim.approvals.some(a => a.role === 'MANAGER');
        }
        if (userRole === 'DIRECTOR') {
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
      const { status, comments } = req.body;
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

      // Fetch the employee who submitted the claim & current approver
      const employee = await getUserById(expense.employee_id);
      const approver = await getUserById(userId);

      // ═══════════════════════════════════════════════════════════════════════
      // REJECTION PATH
      // ═══════════════════════════════════════════════════════════════════════
      if (status === 'REJECTED') {
         await db.query(expenseQueries.recordApprovalAction, [id, userId, 'REJECTED']);
         const finalResult = await db.query(expenseQueries.updateExpenseStatus, ['REJECTED', id, companyId]);
         const rejected = finalResult.rows[0];

         // EMAIL #3: Action Confirmation → Approver
         emailService.approvalActionConfirmation(approver, employee, rejected, 'REJECTED').catch(e => console.error(e));

         // EMAIL #6: Rejection Notification → Employee
         emailService.rejectionNotification(employee, rejected, approver.name, comments || '').catch(e => console.error(e));

         return res.json({ message: 'Expense claim rejected per instant-kill protocol', expense: rejected });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // APPROVAL PATH — record the vote first
      // ═══════════════════════════════════════════════════════════════════════
      await db.query(expenseQueries.recordApprovalAction, [id, userId, 'APPROVED']);

      // EMAIL #3: Action Confirmation → Approver (regardless of finalization)
      emailService.approvalActionConfirmation(approver, employee, expense, 'APPROVED').catch(e => console.error(e));

      // ─── Executive Override (Director / Admin) ─────────────────────────
      if (userRole === 'DIRECTOR' || userRole === 'ADMIN') {
         const autoApprove = await db.query(expenseQueries.updateExpenseStatus, ['APPROVED', id, companyId]);
         const approved = autoApprove.rows[0];

         if (userRole === 'ADMIN') {
           // EMAIL #9: Override → Employee + Manager
           const managers = await getUsersByRole(companyId, 'MANAGER');
           emailService.approvalOverride(employee, managers[0] || null, approved, approver.name).catch(e => console.error(e));
           
           // EMAIL #7: Conditional/Auto Approval → Employee
           emailService.conditionalApprovalNotification(employee, approved, 'Admin executive override').catch(e => console.error(e));
         } else {
           // EMAIL #5: Final Approval → Employee
           emailService.finalApprovalNotification(employee, approved).catch(e => console.error(e));
         }

         return res.json({ message: 'Executive Override: Claim unconditionally approved', expense: approved });
      }

      // ─── Manager/Finance Consensus Check ───────────────────────────────
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
         // Consensus reached — finalize
         const majorityApprove = await db.query(expenseQueries.updateExpenseStatus, ['APPROVED', id, companyId]);
         const approved = majorityApprove.rows[0];

         // EMAIL #5: Final Approval → Employee
         emailService.finalApprovalNotification(employee, approved).catch(e => console.error(e));

         return res.json({ message: 'Manager & Finance Consensus Reached: Claim officially finalized', expense: approved });
      }

      // ─── Still pending — forward/escalate to next tier ─────────────────
      if (userRole === 'MANAGER' && !hasFinance) {
        // EMAIL #4: Forward to Finance
        const financeUsers = await getUsersByRole(companyId, 'FINANCE');
        for (const fo of financeUsers) {
          emailService.forwardToNextApprover(fo, employee, expense, 'Manager').catch(e => console.error(e));
        }
      }
      if (userRole === 'FINANCE' && !hasManager) {
        // EMAIL #4: Forward to Manager (reverse escalation scenario)
        const managers = await getUsersByRole(companyId, 'MANAGER');
        for (const mgr of managers) {
          emailService.forwardToNextApprover(mgr, employee, expense, 'Finance').catch(e => console.error(e));
        }
      }

      return res.json({ message: 'Approval recorded. Escalating for additional consensus.', expense });
    } catch (err) {
      console.error('Error updating claim status:', err);
      res.status(500).json({ message: 'Server error updating claim status' });
    }
  }
};

module.exports = expenseController;
