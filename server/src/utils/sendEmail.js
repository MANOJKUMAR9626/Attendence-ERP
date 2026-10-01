import nodemailer from 'nodemailer';
import dns from 'dns';
import util from 'util';

const lookup = util.promisify(dns.lookup);

const sendEmail = async (options) => {
  // Prevent sending real emails to dummy accounts to avoid bounce-back errors
  const dummyDomains = ['@erp.com', '@test.com', '@example.com', '@dummy.com'];
  if (options.email && dummyDomains.some(domain => options.email.toLowerCase().endsWith(domain))) {
    console.log(`[DRY RUN] Email delivery skipped for dummy address: ${options.email}`);
    return { messageId: 'dummy-id', status: 'skipped' };
  }

  // Check if it's a Gmail account
  const isGmail = process.env.SMTP_EMAIL && process.env.SMTP_EMAIL.endsWith('@gmail.com');

  let host = isGmail ? 'smtp.gmail.com' : (process.env.SMTP_HOST || 'smtp.mailtrap.io');
  let port = isGmail ? 465 : (process.env.SMTP_PORT || 2525);
  let secure = isGmail ? true : false;
  let originalHost = host;

  try {
    const { address } = await lookup(host);
    host = address;
  } catch (e) {
    console.error(`[DNS] Failed to lookup ${host}:`, e);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    name: originalHost,
    auth: {
      user: process.env.SMTP_EMAIL || (isGmail ? undefined : 'test'),
      pass: process.env.SMTP_PASSWORD || (isGmail ? undefined : 'test'),
    },
    tls: {
      servername: originalHost
    }
  });

  // Default HTML Template if none provided
  const defaultHtml = `
    <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; font-size: 28px; margin: 0; font-weight: 800;">Smart<span style="color: #3b82f6;">ERP</span></h1>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">${options.subject}</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${options.message}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
          This is an automated message from SmartERP System.<br/>
          Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  // Define the email options
  const message = {
    from: `${process.env.FROM_NAME || 'SmartERP Admin'} <${process.env.FROM_EMAIL || 'noreply@smarterp.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || defaultHtml,
  };

  // Send the email
  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
  
  // If using Ethereal (test account), log the preview URL
  if (info.messageId && nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
