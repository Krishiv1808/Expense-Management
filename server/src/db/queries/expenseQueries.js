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

  updateExpenseStatus: `
    UPDATE expenses
    SET status = $1
    WHERE id = $2 AND company_id = $3
    RETURNING *;
  `
};

module.exports = expenseQueries;
