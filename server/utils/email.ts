import nodemailer from 'nodemailer'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * Send an email using Nodemailer if SMTP is configured, otherwise fallback to logging it in dev mode.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'Tavrix Bank <no-reply@tavrixbank.com>'

  // Determine if we have valid SMTP configuration
  const hasConfig = !!(host && user && pass)

  if (hasConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        }
      })

      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      })

      console.log(`[Email Service] Email sent successfully to ${options.to}`)
      return true
    } catch (error) {
      console.error('[Email Service] SMTP connection failed. Falling back to local logging.', error)
    }
  }

  // Fallback: log the email to console and a local file for local testing
  try {
    const logsDir = join(process.cwd(), 'server', 'data', 'logs')
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }

    const logPath = join(logsDir, 'sent_emails.log')
    const logEntry = `
========================================
[SENT AT]   : ${new Date().toISOString()}
[TO]        : ${options.to}
[FROM]      : ${from}
[SUBJECT]   : ${options.subject}
[TEXT BODY] :
${options.text}
========================================
`
    // Append to file
    writeFileSync(logPath, logEntry, { flag: 'a', encoding: 'utf-8' })
    console.log(`[Email Service] [MOCK MODE] Email captured and logged to: ${logPath}`)
    return true
  } catch (logErr) {
    console.error('[Email Service] Failed to write mock email log.', logErr)
    return false
  }
}

/**
 * Generate a premium HTML welcome email template for new users.
 */
export function getWelcomeEmailTemplate(fullName: string, email: string): { text: string; html: string } {
  const text = `
Welcome to Tavrix Bank, ${fullName}!

We are thrilled to welcome you as a member of Tavrix Bank. Your online account has been set up successfully.

Here are your next steps to get started:
1. Complete your Profile: Log in and verify your personal details.
2. Complete KYC Verification: Secure your account by uploading your ID.
3. Fund your Account: Make your first deposit or request a transfer to start banking.

If you have any questions or need assistance, please feel free to reach our support team at support@tavrixbank.com or via WhatsApp on our site.

Thank you for choosing Tavrix Bank.

Sincerely,
The Tavrix Bank Team
  `

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Tavrix Bank</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      padding: 40px 32px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
      text-decoration: none;
    }
    .logo-accent {
      color: #60a5fa;
    }
    .content {
      padding: 40px 32px;
      line-height: 1.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      color: #475569;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .steps-container {
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .step-item {
      display: flex;
      margin-bottom: 16px;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-number {
      font-size: 14px;
      font-weight: 800;
      color: #3b82f6;
      background-color: #dbeafe;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .step-desc {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .btn-container {
      text-align: center;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 700;
      text-decoration: none;
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }
    .footer {
      background-color: #f8fafc;
      padding: 32px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-link {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">TAVRIX<span class="logo-accent">BANK</span></div>
      </div>
      <div class="content">
        <h1>Welcome to Tavrix Bank, ${fullName}!</h1>
        <p>We are thrilled to welcome you as a member of Tavrix Bank. Your online banking account has been set up successfully and is now active.</p>
        
        <p>Here are the steps to get started with your account:</p>
        
        <div class="steps-container">
          <div class="step-item">
            <div class="step-number">1</div>
            <div>
              <div class="step-text">Verify Identity (KYC)</div>
              <div class="step-desc">Complete your secure verification process to unlock full transfers and loan features.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div>
              <div class="step-text">Fund Your Account</div>
              <div class="step-desc">Receive wire transfers or deposit checks online to start saving.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div>
              <div class="step-text">Get a Virtual Debit Card</div>
              <div class="step-desc">Instantly issue your secure card for online purchases and digital payments.</div>
            </div>
          </div>
        </div>

        <div class="btn-container">
          <a href="https://tavrixbank.com/login" class="btn">Log In to Your Account</a>
        </div>

        <p>If you have any questions, our support team is available 24/7. Feel free to contact us at support@tavrixbank.com or reply directly to this message.</p>
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a> | 
          <a href="#" class="footer-link">Terms & Conditions</a> | 
          <a href="#" class="footer-link">Help Center</a>
        </div>
        <p>© 2012 – ${new Date().getFullYear()} Tavrix Bank. All rights reserved.<br>Member FDIC. Equal Housing Lender.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  return { text, html }
}

/**
 * Generate a welcome email with credentials and magic login link for admin-created accounts.
 */
export function getAdminCreatedUserEmailTemplate(
  fullName: string,
  email: string,
  loginLink: string,
  tempPassword?: string
): { text: string; html: string } {
  const passwordSectionText = tempPassword 
    ? `Temporary Password: ${tempPassword}\n(You will be asked to change this password on your first login for security purposes.)`
    : 'No password is required if you log in using the one-time magic link.'

  const text = `
Welcome to Tavrix Bank, ${fullName}!

An online banking account has been created for you by the bank administrator.

Your Account Details:
- Email Address: ${email}
${passwordSectionText}

You can log in directly to your dashboard using the one-time magic link below (valid for 24 hours):
${loginLink}

Here are your next steps:
1. Complete KYC Verification: Secure your account by verifying your identity.
2. Fund your Account: Make your first deposit or request a transfer to start banking.

If you have any questions or need assistance, please contact support@tavrixbank.com or reach out to our team via WhatsApp on our site.

Thank you for choosing Tavrix Bank.

Sincerely,
The Tavrix Bank Team
  `

  const passwordSectionHtml = tempPassword
    ? `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-family: monospace;">
        <strong style="color: #64748b;">TEMPORARY PASSWORD:</strong><br>
        <span style="font-size: 16px; font-weight: bold; color: #0f172a; letter-spacing: 1px;">${tempPassword}</span>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">(You will be asked to change this on your first login for safety.)</p>
      </div>
    `
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Tavrix Bank Account is Ready</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      padding: 40px 32px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
      text-decoration: none;
    }
    .logo-accent {
      color: #60a5fa;
    }
    .content {
      padding: 40px 32px;
      line-height: 1.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      color: #475569;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .btn-container {
      text-align: center;
      margin-bottom: 28px;
      margin-top: 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 700;
      text-decoration: none;
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }
    .footer {
      background-color: #f8fafc;
      padding: 32px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-link {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">TAVRIX<span class="logo-accent">BANK</span></div>
      </div>
      <div class="content">
        <h1>Your Tavrix Bank Account is Ready, ${fullName}!</h1>
        <p>An online banking account has been created for you by the bank administrator. Below are your account details and access link.</p>
        
        ${passwordSectionHtml}

        <p>You can access your account instantly without entering credentials by clicking the secure magic link below (expires in 24 hours):</p>

        <div class="btn-container">
          <a href="${loginLink}" class="btn">Log In Instantly (Magic Link)</a>
        </div>

        <p style="font-size: 13px; color: #64748b; text-align: center;">Or copy this URL into your browser:<br>
          <a href="${loginLink}" style="color: #3b82f6; word-break: break-all;">${loginLink}</a>
        </p>

        <p style="margin-top: 28px;">If you have any questions, our support team is available 24/7. Feel free to contact us at support@tavrixbank.com.</p>
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a> | 
          <a href="#" class="footer-link">Terms & Conditions</a> | 
          <a href="#" class="footer-link">Help Center</a>
        </div>
        <p>© 2012 – ${new Date().getFullYear()} Tavrix Bank. All rights reserved.<br>Member FDIC. Equal Housing Lender.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  return { text, html }
}
