import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, text, otp } = req.body || {};

  if (!to) {
    return res.status(400).json({ error: 'Recipient "to" email is required' });
  }

  const smtpUser = process.env.SMTP_USER || 'jobnexaaiplatform@gmail.com';
  const smtpPass = (process.env.SMTP_PASSWORD || 'rtunkeubohmrzeya').replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"JobNexa Intelligence" <${smtpUser}>`,
    to: to,
    subject: subject || `Your JobNexa Verification Code: ${otp || ''}`,
    text: text || `Your JobNexa verification code is: ${otp}. It is valid for 10 minutes.`,
    html: html || `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 28px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">JobNexa Intelligence</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #bfdbfe;">AI Powered Bengaluru Job Platform</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
              Hello,<br><br>
              Please use the following 6-digit One-Time Password (OTP) to complete your sign-in on JobNexa:
            </p>
            <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 14px; padding: 18px; text-align: center; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">One-Time Verification Code</div>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #1e40af; font-family: monospace;">${otp}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">⏱️ Valid for 10 minutes</div>
            </div>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
              Security notice: JobNexa will never ask for your password or verification code. If you did not request this, please disregard this email.
            </p>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
            © 2026 JobNexa AI Intelligence Platform • Bengaluru, India
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[VERCEL EMAIL] Successfully sent email to ${to}`);
    return res.status(200).json({ success: true, message: `Email delivered to ${to}` });
  } catch (err) {
    console.error('[VERCEL EMAIL ERROR]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
