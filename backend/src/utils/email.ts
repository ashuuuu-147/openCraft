// backend/src/utils/email.ts
import nodemailer from 'nodemailer';

// Helper to determine if production SMTP variables are configured
const isSmtpConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

// Global cache for ethereal test account details in development
let testTransporter: nodemailer.Transporter | null = null;

// Initialize mail transporter
const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (isSmtpConfigured()) {
    console.log('📬 Production SMTP mail server configured.');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000, // 5s timeout
      greetingTimeout: 5000,   // 5s timeout
      socketTimeout: 5000,     // 5s timeout
    });
  }

  // Fallback: Generate Ethereal Email test account in development
  if (testTransporter) {
    return testTransporter;
  }

  console.log('💡 SMTP credentials missing. Initializing Ethereal test mailer...');
  const testAccount = await nodemailer.createTestAccount();
  testTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log(`✉️ Ethereal Mailer initialized. Credentials: User=${testAccount.user}`);
  return testTransporter;
};

// HTML Template Helper: Wraps content in OpenCraft's warm cream editorial branding
const getHtmlTemplate = (title: string, bodyHtml: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            background-color: #f7f7f4;
            color: #26251e;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e6e5e0;
            padding: 32px;
          }
          .header {
            border-bottom: 1px solid #e6e5e0;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: -0.5px;
            color: #26251e;
            text-transform: uppercase;
            font-family: monospace;
          }
          .content {
            font-size: 14px;
            line-height: 1.6;
            color: #5a5852;
          }
          h1 {
            font-size: 24px;
            font-weight: 400;
            letter-spacing: -0.5px;
            color: #26251e;
            margin-top: 0;
            margin-bottom: 16px;
          }
          .btn-primary {
            display: inline-block;
            background-color: #f54e00;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 12px;
            font-weight: 600;
            font-family: monospace;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #e6e5e0;
            font-size: 11px;
            color: #a3a19a;
            font-family: monospace;
          }
          .code-block {
            background-color: #fafaf7;
            border: 1px solid #e6e5e0;
            padding: 12px;
            font-family: monospace;
            font-size: 12px;
            color: #26251e;
            white-space: pre-wrap;
            margin: 16px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <span class="logo">▲ OPENCRAFT</span>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            This is an automated notification from OpenCraft. If you did not request this email, please contact support.
          </div>
        </div>
      </body>
    </html>
  `;
};

// 1. Send Welcome Email on Signup
export const sendWelcomeEmail = async (to: string, name: string, role: string) => {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'OpenCraft <noreply@opencraft.dev>';

    let roleDescription = '';
    let dashboardPath = '/dashboard';

    if (role === 'MENTOR') {
      roleDescription = 'Mentor Persona: You are authorized to review submitted code pull requests, assign difficulty scores, and verify tasks.';
      dashboardPath = '/mentor';
    } else if (role === 'ORG_ADMIN') {
      roleDescription = 'Organization Representative: You can deposit bounties, create task issues, and invite collaborators.';
      dashboardPath = '/org';
    } else {
      roleDescription = 'Coder Contributor: You can claim open source tasks, submit pull request links, and earn reputational awards.';
    }

    const title = 'Welcome to OpenCraft';
    const bodyHtml = `
      <h1>Hi ${name || 'there'},</h1>
      <p>Welcome to OpenCraft! Your contribution account has been successfully set up.</p>
      <p><strong>Persona Details:</strong><br>${roleDescription}</p>
      <p>You can manage your tasks, review submissions, and adjust payout configurations directly in your central console workspace.</p>
      
      <div class="code-block">&gt; git clone https://github.com/opencraft-platform/opencraft.git
&gt; npm install
&gt; npm run dev</div>

      <a href="${process.env.FRONTEND_URL || 'https://opencrafttt.vercel.app'}${dashboardPath}" class="btn-primary">Enter Dashboard</a>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Welcome to OpenCraft, ${name}!`,
      html: getHtmlTemplate(title, bodyHtml),
    });

    if (!isSmtpConfigured()) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n✉️ [TEST EMAIL SENT] Welcome Email for ${to}`);
      console.log(`🔗 Preview URL: ${previewUrl}\n`);
    } else {
      console.log(`✉️ [PRODUCTION EMAIL SENT] Welcome Email to ${to}`);
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// 2. Send Login Alert on Sign In
export const sendLoginAlert = async (to: string, name: string) => {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'OpenCraft <noreply@opencraft.dev>';
    const timestamp = new Date().toUTCString();

    const title = 'OpenCraft Security Alert: New Login Detected';
    const bodyHtml = `
      <h1>Security Alert</h1>
      <p>Hello ${name},</p>
      <p>A new sign-in occurred for your OpenCraft account on <strong>${timestamp}</strong>.</p>
      
      <div class="code-block">Event: LOGIN_ALERT
Email: ${to}
Time: ${timestamp}
Host: ${process.env.FRONTEND_URL || 'https://opencrafttt.vercel.app'}</div>

      <p>If this was you, no action is required. If you did not perform this login, please change your password immediately or contact an OpenCraft security administrator.</p>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'OpenCraft Login Security Alert',
      html: getHtmlTemplate(title, bodyHtml),
    });

    if (!isSmtpConfigured()) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n✉️ [TEST EMAIL SENT] Login Alert for ${to}`);
      console.log(`🔗 Preview URL: ${previewUrl}\n`);
    } else {
      console.log(`✉️ [PRODUCTION EMAIL SENT] Login Alert to ${to}`);
    }
  } catch (error) {
    console.error('Failed to send login alert:', error);
  }
};

// Export configuration status for verification (without exposing password)
export const getEmailConfigStatus = () => {
  return {
    isConfigured: isSmtpConfigured(),
    mode: isSmtpConfigured() ? 'SMTP (Production)' : 'Ethereal Sandbox (Development)',
    from: process.env.SMTP_FROM || 'OpenCraft <noreply@opencraft.dev>'
  };
};

// Send a diagnostic test email and return the result
export const testSendEmail = async (to: string) => {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || 'OpenCraft <noreply@opencraft.dev>';
  
  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'OpenCraft SMTP Diagnostic Test',
    text: 'If you receive this email, your SMTP email configuration is working perfectly!',
    html: '<h3>SMTP Diagnostic Test</h3><p>If you receive this email, your SMTP email configuration is working perfectly!</p>',
  });
  
  return {
    messageId: info.messageId,
    envelope: info.envelope,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    previewUrl: !isSmtpConfigured() ? nodemailer.getTestMessageUrl(info) : null
  };
};
