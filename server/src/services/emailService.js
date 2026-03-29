const nodemailer = require('nodemailer');

// ─── Transporter ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Brand Wrapper ───────────────────────────────────────────────────────────
const wrap = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3faff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3faff;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,51,69,0.08);">
        <tr>
          <td style="background:#003345;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Fimberse</p>
            <p style="margin:4px 0 0;font-size:10px;font-weight:700;color:rgba(255,255,255,0.55);letter-spacing:3px;text-transform:uppercase;">Enterprise Reimbursement</p>
          </td>
        </tr>
        <tr><td style="padding:40px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#f3faff;padding:20px 40px;border-top:1px solid #e6f0f5;">
            <p style="margin:0;font-size:12px;color:#40484c;opacity:0.5;text-align:center;">
              This is an automated notification from Fimberse. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const badge = (text, color = '#003345', bg = '#e6f6ff') =>
  `<span style="display:inline-block;padding:4px 12px;background:${bg};color:${color};border-radius:20px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">${text}</span>`;

const claimRow = (label, value) =>
  `<tr>
    <td style="padding:10px 0;font-size:13px;font-weight:600;color:#40484c;border-bottom:1px solid #f3faff;width:40%;">${label}</td>
    <td style="padding:10px 0;font-size:13px;font-weight:700;color:#003345;border-bottom:1px solid #f3faff;">${value}</td>
  </tr>`;

const claimTable = (expense) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#f3faff;border-radius:12px;padding:4px 20px;">
    ${claimRow('Category', expense.category || 'Uncategorized')}
    ${claimRow('Amount', `${expense.currency || '$'} ${parseFloat(expense.amount).toFixed(2)}`)}
    ${claimRow('Date', new Date(expense.date || expense.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }))}
    ${expense.description ? claimRow('Description', expense.description) : ''}
  </table>`;

const btn = (text, href) =>
  `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#003345;color:#fff;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">${text}</a>`;

// ─── Send Helper ────────────────────────────────────────────────────────────
const send = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`📧 [EMAIL SKIP] No SMTP credentials set. Would send "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Fimberse" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: "${subject}" -> ${to}`);
  } catch (err) {
    console.error(`📧 Email failed: "${subject}" -> ${to}:`, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const emailService = {

  // 1. New Approval Request -> Manager
  newApprovalRequest: async (manager, employee, expense) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#003345;">New Expense Claim</h2>
      <p style="margin:0 0 20px;color:#40484c;">A new reimbursement request requires your approval.</p>
      ${badge('Action Required', '#003345', '#e6f6ff')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;"><strong style="color:#003345;">${employee.name}</strong> submitted this claim and it is now awaiting your review.</p>
      ${btn('Review in Dashboard', `${process.env.CLIENT_URL || 'http://localhost:5173'}/approver-dashboard/overview`)}`;
    await send(manager.email, `Action Required: New Expense Claim from ${employee.name}`, wrap('New Approval Request', body));
  },

  // 2. Approval Reminder -> Manager
  approvalReminder: async (manager, employee, expense, hoursOld) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#b45309;">Pending Approval Reminder</h2>
      <p style="margin:0 0 20px;color:#40484c;">A claim has been waiting for your review for <strong>${hoursOld} hours</strong>.</p>
      ${badge('Overdue', '#b45309', '#fef3c7')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;">Please take action to avoid automatic escalation to Finance / Director.</p>
      ${btn('Review Now', `${process.env.CLIENT_URL || 'http://localhost:5173'}/approver-dashboard/overview`)}`;
    await send(manager.email, `Reminder: Pending Claim from ${employee.name} (${hoursOld}hrs)`, wrap('Approval Reminder', body));
  },

  // 3. Approval Action Confirmation -> Approver
  approvalActionConfirmation: async (approver, employee, expense, action) => {
    const isApproved = action === 'APPROVED';
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#003345;">Action Recorded</h2>
      <p style="margin:0 0 20px;color:#40484c;">Your decision has been securely recorded in the system.</p>
      ${badge(isApproved ? 'Approved' : 'Rejected', isApproved ? '#14696d' : '#ba1a1a', isApproved ? '#d1fae5' : '#fee2e2')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;">You <strong>${isApproved ? 'approved' : 'rejected'}</strong> the claim submitted by <strong style="color:#003345;">${employee.name}</strong>.</p>`;
    await send(approver.email, `Confirmed: You ${isApproved ? 'Approved' : 'Rejected'} a Claim`, wrap('Action Confirmation', body));
  },

  // 4. Forward to Next Approver (Finance/Director)
  forwardToNextApprover: async (nextApprover, employee, expense, fromRole) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#003345;">Claim Escalated to Your Level</h2>
      <p style="margin:0 0 20px;color:#40484c;">An expense has been forwarded to you after ${fromRole} review.</p>
      ${badge('Escalated', '#6d28d9', '#ede9fe')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;">Submitted by <strong style="color:#003345;">${employee.name}</strong>. This claim has cleared the ${fromRole} tier and now requires your sign-off.</p>
      ${btn('Review in Dashboard', `${process.env.CLIENT_URL || 'http://localhost:5173'}/approver-dashboard/overview`)}`;
    await send(nextApprover.email, `Escalated Claim from ${employee.name} - Your Review Needed`, wrap('Forward to Next Approver', body));
  },

  // 5. Final Approval Notification -> Employee
  finalApprovalNotification: async (employee, expense) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#14696d;">Expense Approved!</h2>
      <p style="margin:0 0 20px;color:#40484c;">Great news! Your reimbursement request has been fully approved.</p>
      ${badge('Fully Approved', '#14696d', '#d1fae5')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;">Your reimbursement of <strong style="color:#003345;">${expense.currency || '$'} ${parseFloat(expense.amount).toFixed(2)}</strong> has passed all approval tiers.</p>
      ${btn('View in My Claims', `${process.env.CLIENT_URL || 'http://localhost:5173'}/user-dashboard/accepted`)}`;
    await send(employee.email, `Approved: Your Expense Claim for ${expense.currency || ''} ${parseFloat(expense.amount).toFixed(2)}`, wrap('Expense Approved', body));
  },

  // 6. Rejection Notification -> Employee
  rejectionNotification: async (employee, expense, rejectedBy, comments) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ba1a1a;">Expense Claim Rejected</h2>
      <p style="margin:0 0 20px;color:#40484c;">Unfortunately, your reimbursement request has been rejected.</p>
      ${badge('Rejected', '#ba1a1a', '#fee2e2')}
      ${claimTable(expense)}
      ${comments ? `<div style="margin:16px 0;padding:16px;background:#fff5f5;border-left:4px solid #ba1a1a;border-radius:8px;"><p style="margin:0;font-size:13px;font-weight:600;color:#40484c;">Reason: <em>${comments}</em></p></div>` : ''}
      <p style="font-size:14px;color:#40484c;">Rejected by <strong style="color:#003345;">${rejectedBy}</strong>.</p>
      ${btn('View My Claims', `${process.env.CLIENT_URL || 'http://localhost:5173'}/user-dashboard/claims`)}`;
    await send(employee.email, `Rejected: Your Expense Claim`, wrap('Expense Rejected', body));
  },

  // 7. Conditional / Auto-Approval -> Employee
  conditionalApprovalNotification: async (employee, expense, reason) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#14696d;">Auto-Approved</h2>
      <p style="margin:0 0 20px;color:#40484c;">Your expense was automatically approved based on company policy.</p>
      ${badge('Auto-Approved', '#14696d', '#d1fae5')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;"><strong>Reason:</strong> ${reason}</p>
      ${btn('View in My Claims', `${process.env.CLIENT_URL || 'http://localhost:5173'}/user-dashboard/accepted`)}`;
    await send(employee.email, `Auto-Approved: Your Expense Claim`, wrap('Auto-Approval', body));
  },

  // 8. Escalation Email -> Admin/Higher Authority
  escalationAlert: async (admin, employee, expense, hoursOld) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#b45309;">Escalation Alert</h2>
      <p style="margin:0 0 20px;color:#40484c;">An expense claim has exceeded SLA thresholds and requires administrative attention.</p>
      ${badge('Escalated - SLA Breach', '#b45309', '#fef3c7')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;">This claim from <strong style="color:#003345;">${employee.name}</strong> has been pending for <strong>${hoursOld} hours</strong>.</p>
      ${btn('View in Admin Dashboard', `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin-dashboard/approved`)}`;
    await send(admin.email, `SLA Alert: Claim Awaiting ${hoursOld}hrs - Needs Action`, wrap('Escalation Alert', body));
  },

  // 9. Approval Override -> Employee + Manager
  approvalOverride: async (employee, manager, expense, overriddenBy) => {
    const empBody = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#14696d;">Expense Approved (Admin Override)</h2>
      <p style="margin:0 0 20px;color:#40484c;">An administrator has overridden the normal approval process for your claim.</p>
      ${badge('Admin Override', '#6d28d9', '#ede9fe')}
      ${claimTable(expense)}
      <p style="font-size:14px;color:#40484c;">Overridden by <strong style="color:#003345;">${overriddenBy}</strong>. Your reimbursement is now finalized.</p>
      ${btn('View Accepted Claims', `${process.env.CLIENT_URL || 'http://localhost:5173'}/user-dashboard/accepted`)}`;
    await send(employee.email, `Approved via Admin Override`, wrap('Admin Override', empBody));

    if (manager) {
      const mgrBody = `
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#6d28d9;">Override Notice</h2>
        <p style="margin:0 0 20px;color:#40484c;">An administrator has overridden a claim that was in your approval queue.</p>
        ${badge('Admin Override', '#6d28d9', '#ede9fe')}
        ${claimTable(expense)}
        <p style="font-size:14px;color:#40484c;">This claim from <strong style="color:#003345;">${employee.name}</strong> was overridden by <strong>${overriddenBy}</strong>.</p>`;
      await send(manager.email, `Override Notice: Claim from ${employee.name} Bypassed Normal Process`, wrap('Override Notice', mgrBody));
    }
  },

  // --- OTP / Forgot Password ---
  sendPasswordResetOTP: async (user, otp) => {
    const body = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#003345;">Password Reset</h2>
      <p style="margin:0 0 24px;color:#40484c;">You requested a password reset. Use the OTP below to proceed. It expires in <strong>15 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0;">
        <div style="display:inline-block;background:#003345;border-radius:16px;padding:24px 48px;">
          <p style="margin:0;font-size:44px;font-weight:900;color:#ffffff;letter-spacing:12px;">${otp}</p>
        </div>
      </div>
      <p style="font-size:13px;color:#40484c;opacity:0.7;text-align:center;">Do not share this OTP with anyone. If you didn't request this, you can safely ignore this email.</p>`;
    await send(user.email, `Your Fimberse OTP: ${otp}`, wrap('Password Reset OTP', body));
  },
};

module.exports = emailService;
