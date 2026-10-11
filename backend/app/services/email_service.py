import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings


def is_smtp_configured() -> bool:
    """Check if SMTP credentials have been provided."""
    return bool(settings.SMTP_USER and settings.SMTP_PASSWORD)


def send_otp_email(to_email: str, otp_code: str, purpose: str = "register") -> bool:
    """
    Send a professional HTML email with the 6-digit OTP code.
    If SMTP credentials are configured, sends real email via SMTP.
    Otherwise, logs OTP clearly for development and testing.
    """
    subject = f"Your JobNexa Verification Code: {otp_code}"
    action_text = "complete your registration" if purpose == "register" else "sign in to your account"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{subject}</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
        .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }}
        .header {{ background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 32px 24px; text-align: center; color: #ffffff; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
        .header p {{ margin: 6px 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500; }}
        .content {{ padding: 32px 28px; }}
        .intro {{ font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }}
        .otp-box {{ background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0; }}
        .otp-label {{ font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }}
        .otp-code {{ font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1e40af; font-family: 'SF Mono', Consolas, Monaco, monospace; margin: 0; }}
        .expiry {{ font-size: 12px; color: #64748b; font-weight: 500; margin-top: 8px; }}
        .security-note {{ background: #f1f5f9; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; }}
        .footer {{ background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>JobNexa Intelligence</h1>
          <p>AI Powered Bengaluru Job Discovery Platform</p>
        </div>
        <div class="content">
          <p class="intro">
            Hello,<br><br>
            Please use the following 6-digit One-Time Password (OTP) to <strong>{action_text}</strong> on JobNexa.
          </p>
          
          <div class="otp-box">
            <div class="otp-label">One-Time Verification Code</div>
            <div class="otp-code">{otp_code}</div>
            <div class="expiry">⏱️ Valid for 10 minutes</div>
          </div>

          <div class="security-note">
            🔒 <strong>Security Notice:</strong> JobNexa will never ask for your password or verification code. If you did not request this OTP, please disregard this email.
          </div>
        </div>
        <div class="footer">
          © 2026 JobNexa AI Intelligence Platform • Daily Automated Job Scanning at 8:00 AM • Bengaluru, India
        </div>
      </div>
    </body>
    </html>
    """

    plain_content = f"Your JobNexa verification code is: {otp_code}. It is valid for 10 minutes."

    # If SMTP is configured, attempt sending real email
    if is_smtp_configured():
        try:
            from_addr = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{from_addr}>"
            msg["To"] = to_email

            part1 = MIMEText(plain_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(from_addr, [to_email], msg.as_string())

            print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via SMTP")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE] SMTP delivery failed to {to_email}: {e}")
            # Fallback to local logging so registration is not blocked during setup
            print(f"[EMAIL SERVICE DEV LOG] OTP for {to_email}: {otp_code}")
            return True
    else:
        # Development / Waiting for User SMTP credentials
        print(f"[EMAIL SERVICE DEV LOG] [SMTP pending configuration] To: {to_email} | OTP: {otp_code} | Purpose: {purpose}")
        return True
