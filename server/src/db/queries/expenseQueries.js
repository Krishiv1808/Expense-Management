const expenseQueries = {
  createExpense: `
    INSERT INTO expenses (employee_id, company_id, amount, currency, category, description, date, receipt_url, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
    RETURNING *;
  `,

  getExpensesByEmployee: `
    SELECT * FROM expenses
    WHERE employee_id = $1
    ORDER BY created_at DESC;
  `,

  getPendingExpensesByCompany: `
    SELECT e.*, u.name as employee_name, u.email as employee_email 
    FROM expenses e
    JOIN users u ON e.employee_id = u.id
    WHERE e.company_id = $1 AND e.status = 'PENDING'
    ORDER BY e.created_at ASC;
  `,

  getApprovedExpensesByCompany: `
    SELECT e.*, u.name as employee_name, u.email as employee_email 
    FROM expenses e
    JOIN users u ON e.employee_id = u.id
    WHERE e.company_id = $1 AND e.status = 'APPROVED'
    ORDER BY e.created_at DESC;
  `,

  updateExpenseStatus: `
    UPDATE expenses
    SET status = $1
    WHERE id = $2 AND company_id = $3
    RETURNING *;
  `,

  getPendingExpensesWithApprovals: `
    SELECT e.*, u.name as employee_name, u.email as employee_email,
           COALESCE(
             (SELECT json_agg(json_build_object('user_id', a.user_id, 'role', approver.role, 'status', a.status))
              FROM approval_actions a
              JOIN users approver ON a.user_id = approver.id
              WHERE a.expense_id = e.id),
             '[]'::json
           ) as approvals
    FROM expenses e
    JOIN users u ON e.employee_id = u.id
    WHERE e.company_id = $1 AND e.status = 'PENDING'
    ORDER BY e.created_at ASC;
  `,

  recordApprovalAction: `
    INSERT INTO approval_actions (expense_id, user_id, status)
    VALUES ($1, $2, $3)
    RETURNING *;
  `
};

module.exports = expenseQueries;
