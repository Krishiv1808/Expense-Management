# Fimberse — Expense & Reimbursement Management System

A full-stack expense management application with role-based access control, multi-step approval workflows, OCR receipt scanning, and OTP-based password recovery.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Server Setup](#2-server-setup)
  - [3. Client Setup](#3-client-setup)
  - [4. Database Setup](#4-database-setup)
  - [5. Run the Application](#5-run-the-application)
- [Environment Variables](#environment-variables)
  - [Server `.env`](#server-env)
  - [Client `.env`](#client-env)
- [User Roles & Access](#user-roles--access)
- [Application Flow](#application-flow)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Running on LAN](#running-on-lan)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 19, Vite, TailwindCSS v4, Framer Motion, Lucide Icons, Axios        |
| Backend    | Node.js, Express 5, JWT Authentication, bcryptjs, Multer                   |
| Database   | PostgreSQL (local or cloud via Supabase/Neon)                              |
| OCR        | Tesseract.js (receipt scanning)                                            |
| Email      | Nodemailer (SMTP — for password reset OTPs)                                |
| Currency   | REST Countries API (auto-detects currency from country at signup)          |

---

## Prerequisites

Make sure you have the following installed on your system:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **npm** >= 9.x (comes with Node.js)
- **PostgreSQL** >= 14.x — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

Verify installations:

```bash
node -v
npm -v
psql --version
git --version
```

---

## Project Structure

```
Expense-Management/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AppLayout.jsx       # Sidebar + Outlet layout for dashboards
│   │   │   ├── Button.jsx          # Reusable button component
│   │   │   ├── ChangePassword.jsx  # Password change form
│   │   │   ├── ProtectedRoute.jsx  # Auth guard for dashboard routes
│   │   │   ├── PublicRoute.jsx     # Redirects logged-in users away from login/signup
│   │   │   ├── Sections.jsx        # Landing page sections (Navbar, Hero, etc.)
│   │   │   └── UI.jsx              # Card, Badge components
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state (token, user, login/logout)
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      # User management (CRUD, role changes)
│   │   │   ├── ApproverDashboard.jsx   # Manager/Finance/Director claim approvals
│   │   │   ├── ApprovedClaims.jsx      # View approved claims
│   │   │   ├── EmployeeDashboard.jsx   # Submit expenses with OCR receipt scan
│   │   │   ├── EmployeeAcceptedClaims.jsx # Employee's accepted claims view
│   │   │   ├── Login.jsx              # Login + Forgot Password (OTP flow)
│   │   │   └── Signup.jsx             # Company registration
│   │   ├── App.jsx             # Router configuration
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── .env                    # Client env variables
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # PostgreSQL connection pool
│   │   ├── db/
│   │   │   ├── schema.sql          # Full database schema
│   │   │   ├── queries/            # SQL query strings
│   │   │   ├── init.js             # DB initialization helper
│   │   │   └── seedDummyClaims.js  # Seed sample expense data
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification + isAdmin guard
│   │   │   └── authValidation.js   # express-validator rules
│   │   ├── modules/
│   │   │   ├── auth/               # Auth routes, controller, validation
│   │   │   ├── user/               # User CRUD routes + controller
│   │   │   └── expense/            # Expense routes + controller
│   │   ├── services/
│   │   │   ├── currencyService.js  # REST Countries API for currency lookup
│   │   │   ├── emailService.js     # Nodemailer SMTP service
│   │   │   └── ocrService.js       # Tesseract.js receipt parser
│   │   └── server.js              # Express app entry point
│   ├── create-db.js            # Creates database + runs schema
│   ├── migrate.js              # Incremental migrations
│   ├── .env                    # Server env variables
│   └── package.json
│
├── uploads/                    # Uploaded receipt images
└── README.md
```

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Krishiv1808/Expense-Management.git
cd Expense-Management
```

### 2. Server Setup

```bash
cd server
npm install
```

Create the environment file `server/.env`:

```env
# --- Local Database Configuration (Priority) ---
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=your_postgres_password
LOCAL_DB_NAME=expense_mgmt
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432

# --- Cloud Database Configuration (Fallback) ---
# Uncomment and fill these if you have a cloud DB (Supabase, Neon, etc.)
# CLOUD_DB_USER=postgres
# CLOUD_DB_PASSWORD=your_cloud_password
# CLOUD_DB_NAME=postgres
# CLOUD_DB_HOST=db.xxxxx.supabase.co
# CLOUD_DB_PORT=5432

# --- Authentication ---
JWT_SECRET=your_secure_random_secret_here

# --- SMTP Configuration (for Password Reset OTPs) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# --- Frontend URL ---
CLIENT_URL=http://localhost:5173
```

> **Important:** The database config prioritizes `LOCAL_DB_*` variables. If they are set, the cloud values are ignored. To use only cloud, remove or comment out the `LOCAL_DB_*` variables.

### 3. Client Setup

```bash
cd ../client
npm install
```

The client `.env` file is optional for local development. The API URL is currently hardcoded to `http://localhost:5000` in the frontend code.

### 4. Database Setup

Make sure PostgreSQL is running, then:

```bash
cd ../server

# Step 1: Create the database and initialize schema
node create-db.js

# Step 2: Run migrations (adds newer columns/tables)
node migrate.js
```

You should see output like:
```
Connected to default postgres database.
Database expense_mgmt created successfully.
Connected to expense_mgmt database.
Schema initialized successfully.
```

### 5. Run the Application

Open **two terminals**:

**Terminal 1 — Start the server:**
```bash
cd server
npm run dev
```
You should see: `Server running in development mode on port 5000`

**Terminal 2 — Start the client:**
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173/`

Open your browser and navigate to **http://localhost:5173**

---

## Environment Variables

### Server `.env`

| Variable             | Required | Description                                       |
| -------------------- | -------- | ------------------------------------------------- |
| `LOCAL_DB_USER`      | Yes*     | PostgreSQL username for local database             |
| `LOCAL_DB_PASSWORD`  | Yes*     | PostgreSQL password for local database             |
| `LOCAL_DB_NAME`      | Yes*     | Database name (e.g., `expense_mgmt`)               |
| `LOCAL_DB_HOST`      | Yes*     | Database host (e.g., `localhost`)                   |
| `LOCAL_DB_PORT`      | Yes*     | Database port (e.g., `5432`)                        |
| `CLOUD_DB_USER`      | No       | Cloud DB username (used if LOCAL_DB_* not present) |
| `CLOUD_DB_PASSWORD`  | No       | Cloud DB password                                  |
| `CLOUD_DB_NAME`      | No       | Cloud DB name                                      |
| `CLOUD_DB_HOST`      | No       | Cloud DB host                                      |
| `CLOUD_DB_PORT`      | No       | Cloud DB port                                      |
| `JWT_SECRET`         | Yes      | Secret key for JWT token signing                   |
| `SMTP_HOST`          | No**     | SMTP server host (for password reset emails)       |
| `SMTP_PORT`          | No**     | SMTP server port                                   |
| `SMTP_USER`          | No**     | SMTP email address                                 |
| `SMTP_PASS`          | No**     | SMTP password / app password                       |
| `CLIENT_URL`         | No       | Frontend URL for email links                       |

\* Either `LOCAL_DB_*` or `CLOUD_DB_*` variables must be provided — at least one set is required.  
\** Required only if you want the "Forgot Password" OTP feature to work.

### Client `.env`

Currently the client does not require any environment variables for local development.

---

## User Roles & Access

| Role       | Dashboard              | Capabilities                                                   |
| ---------- | ---------------------- | -------------------------------------------------------------- |
| `ADMIN`    | `/admin-dashboard`     | Create/edit/delete users, change roles, manage company settings |
| `MANAGER`  | `/approver-dashboard`  | Approve/reject submitted expense claims                        |
| `FINANCE`  | `/approver-dashboard`  | Approve/reject submitted expense claims                        |
| `DIRECTOR` | `/approver-dashboard`  | Approve/reject submitted expense claims                        |
| `EMPLOYEE` | `/user-dashboard`      | Submit expenses with receipt upload (OCR), view claim status   |

---

## Application Flow

### First-Time Setup (Company Registration)

1. Go to **http://localhost:5173** → Click **"Company Setup"**
2. Fill in: Admin name, email, password, company name, and country
3. The system automatically resolves the default currency from the selected country
4. After signup, you are redirected to the **Admin Dashboard**

### Admin: Provisioning Users

1. In the Admin Dashboard → Click **"Add New User"**
2. Enter: name, email, initial password, and role
3. Share the credentials with the user directly
4. The user can log in and change their password from Settings

### Employee: Submitting an Expense

1. Employee logs in → redirected to **Employee Dashboard**
2. Fill in expense details (amount, category, description, date)
3. Optionally upload a receipt image — OCR will auto-extract the amount
4. Submit the claim → status becomes `PENDING`

### Approver: Reviewing Claims

1. Manager/Finance/Director logs in → redirected to **Approver Dashboard**
2. View pending claims → Approve or Reject with comments
3. Approved claims appear in the **Approved Claims** view

### Password Reset

1. On the Login page → Click **"Forgot password?"**
2. Enter email → receive a 6-digit OTP via email
3. Enter OTP → set new password

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint                | Description                              | Auth Required |
| ------ | ----------------------- | ---------------------------------------- | ------------- |
| POST   | `/register`             | Register a new company + admin account   | No            |
| POST   | `/login`                | Login and get JWT token                  | No            |
| GET    | `/countries`            | Get list of all countries                | No            |
| POST   | `/forgot-password`      | Send OTP to email                        | No            |
| POST   | `/verify-reset-otp`     | Verify OTP and get reset token           | No            |
| POST   | `/reset-password`       | Set new password using reset token       | No            |

### Users (`/api/users`)

| Method | Endpoint          | Description                      | Auth Required      |
| ------ | ----------------- | -------------------------------- | ------------------ |
| GET    | `/`               | Get all users in same company    | Yes (any role)     |
| POST   | `/`               | Create a new user                | Yes (Admin only)   |
| PATCH  | `/:id/role`       | Update a user's role             | Yes (Admin only)   |
| DELETE | `/:id`            | Delete a user from company       | Yes (Admin only)   |

### Expenses (`/api/expenses`)

| Method | Endpoint          | Description                       | Auth Required      |
| ------ | ----------------- | --------------------------------- | ------------------ |
| POST   | `/`               | Submit a new expense claim        | Yes                |
| GET    | `/my`             | Get current user's expenses       | Yes                |
| GET    | `/pending`        | Get pending expenses to approve   | Yes (Approvers)    |
| PATCH  | `/:id/approve`    | Approve an expense                | Yes (Approvers)    |
| PATCH  | `/:id/reject`     | Reject an expense                 | Yes (Approvers)    |

---

## Database Schema

The database consists of 7 tables:

| Table                | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `companies`          | Company info (name, default currency, country)             |
| `users`              | All users with roles, linked to a company                  |
| `expenses`           | Expense claims with amount, currency, status, receipt      |
| `approval_workflows` | Named approval workflow definitions per company            |
| `approval_steps`     | Individual steps in a workflow (sequential, percentage)    |
| `step_approvers`     | Which users can approve at each step                       |
| `approval_actions`   | Audit log of approve/reject actions on expenses            |
| `password_resets`    | OTP storage for password reset flow                        |

---

## Running on LAN

By default, the app only works on `localhost`. To make it accessible from other devices on your local network:

### 1. Find your machine's local IP

```bash
# Linux
hostname -I

# macOS
ipconfig getifaddr en0

# Windows
ipconfig
```

Example: `192.168.1.5`

### 2. Start the Vite dev server with `--host`

```bash
cd client
npm run dev -- --host
```

This will show something like:
```
Local:   http://localhost:5173/
Network: http://192.168.1.5:5173/
```

### 3. Update API URLs in Frontend

Currently the frontend has hardcoded `http://localhost:5000` for API calls. For LAN access, you would need to replace these with your machine's IP address (e.g., `http://192.168.1.5:5000`).

> **Tip:** A future improvement would be to use a `VITE_API_URL` environment variable to make this configurable without code changes.

### 4. Make sure the Express server listens on all interfaces

Express binds to `0.0.0.0` by default, so the backend should already be accessible from LAN on port `5000`.

### 5. Firewall

Ensure ports `5173` (Vite) and `5000` (Express) are not blocked by your firewall.

---

## Troubleshooting

### Database connection fails
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Verify your `LOCAL_DB_*` credentials in `server/.env` match your PostgreSQL setup
- Check that `LOCAL_DB_PASSWORD` is correct for the `postgres` user

### `node create-db.js` fails
- Make sure you can connect to PostgreSQL manually: `psql -U postgres`
- If you get a password error, update `LOCAL_DB_PASSWORD` in your `.env`

### Server crashes on startup
- Check if port 5000 is already in use: `lsof -i :5000`
- Ensure all dependencies are installed: `cd server && npm install`

### "Invalid token" errors
- Clear your browser's localStorage: open DevTools → Application → Local Storage → Clear
- Re-login to get a fresh JWT token

### Password Reset OTP not received
- Ensure SMTP credentials are configured in `server/.env`
- If using Gmail, you need a **Gmail App Password** (not your regular password)
  - Go to: Google Account → Security → App Passwords → Generate one for "Mail"
- Check your spam folder

### Receipt OCR not extracting amounts
- Ensure the receipt image is clear and well-lit
- The OCR engine works best with printed text (not handwritten)
- Supported formats: JPG, PNG

---

## License

This project is for educational and internal use.