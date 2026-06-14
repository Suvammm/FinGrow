const nodemailer = require('nodemailer');

let cachedTransporter = null;

const buildTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpHost && !(smtpUser && smtpPass)) {
    return null;
  }

  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true',
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }
  return cachedTransporter;
};

const isReminderEmailConfigured = () => Boolean(getTransporter());

const buildOtpHtml = ({ otp, userName }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinGrow OTP</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f7fb;margin:0;padding:0;width:100%;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#1d4ed8;">
                <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#dbeafe;">FinGrow Security</div>
                <div style="font-family:Arial,sans-serif;font-size:28px;line-height:1.2;font-weight:700;color:#ffffff;margin-top:12px;">
                  Your login verification code
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#0f172a;margin-bottom:16px;">
                  Hello <strong>${userName || 'there'}</strong>,
                </div>
                <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#475569;margin-bottom:24px;">
                  Use the one-time password below to complete your FinGrow login. This code is valid for the next 10 minutes.
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;border:1px solid #c7d2fe;border-radius:18px;background-color:#eef2ff;">
                  <tr>
                    <td align="center" style="padding:22px 16px;">
                      <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#4338ca;margin-bottom:10px;">
                        One-Time Password
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:36px;line-height:1;font-weight:800;letter-spacing:10px;color:#0f172a;">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e2e8f0;border-radius:14px;background-color:#f8fafc;">
                  <tr>
                    <td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#475569;">
                      <strong style="color:#0f172a;">Security note:</strong> If you did not request this code, you can safely ignore this email. Never share your OTP with anyone.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid #e2e8f0;background-color:#f8fafc;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#64748b;">
                Sent by FinGrow Authentication
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const sendEmailOtpMail = async ({ to, otp, userName }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return false;
  }

  const senderEmail = process.env.REMINDER_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
  const textBody = [
    `Hello ${userName || 'there'},`,
    '',
    `Your FinGrow OTP is: ${otp}`,
    'It expires in 10 minutes.',
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n');

  await transporter.sendMail({
    from: `FinGrow Authentication <${senderEmail}>`,
    to,
    subject: 'Your FinGrow login OTP',
    text: textBody,
    html: buildOtpHtml({ otp, userName }),
  });

  return true;
};

const sendReceivableReminderEmail = async ({ to, userName, debtorName, amount, reason, deadline, reminderFrequency }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return false;
  }

  const from = process.env.REMINDER_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
  const dueText = deadline ? new Date(deadline).toLocaleString('en-IN') : 'Not specified';

  await transporter.sendMail({
    from,
    to,
    subject: `Reminder: ${debtorName} owes you money`,
    text: [
      `Hello ${userName || 'there'},`,
      '',
      `This is your ${reminderFrequency.toLowerCase()} reminder that ${debtorName} owes you INR ${amount}.`,
      `Reason: ${reason || 'Not specified'}`,
      `Expected by: ${dueText}`,
      '',
      'Please follow up and collect the payment.',
      '',
      'Sent from FinGrow reminders.',
    ].join('\n'),
  });

  return true;
};

module.exports = {
  isReminderEmailConfigured,
  sendEmailOtpMail,
  sendReceivableReminderEmail,
};
