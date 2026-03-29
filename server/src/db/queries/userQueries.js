const userQueries = {
  createCompany: `
    INSERT INTO companies (name, default_currency, country)
    VALUES ($1, $2, $3)
    RETURNING *;
  `,

  createUser: `
    INSERT INTO users (name, email, password_hash, role, company_id, manager_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role, company_id, manager_id;
  `,

  findByEmail: `
    SELECT u.*, c.name as company_name, c.default_currency
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.email = $1;
  `,

  getUserById: `
    SELECT id, name, email, role, company_id, manager_id
    FROM users
    WHERE id = $1;
  `,

  getAllUsersInCompany: `
    SELECT id, name, email, role, manager_id
    FROM users
    WHERE company_id = $1;
  `,

  updateUserRole: `
    UPDATE users
    SET role = $1
    WHERE id = $2
    RETURNING id, name, email, role;
  `,

  setManager: `
    UPDATE users
    SET manager_id = $1
    WHERE id = $2
    RETURNING *;
  `
};

module.exports = userQueries;
