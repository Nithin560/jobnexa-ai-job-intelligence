import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from dotenv import load_dotenv
from app.core.config import settings


def get_smtp_credentials():
    # Reload from .env if present
    load_dotenv(override=True)
    user = os.getenv("SMTP_USER") or settings.SMTP_USER
    raw_pass = os.getenv("SMTP_PASSWORD") or settings.SMTP_PASSWORD or ""
    password = raw_pass.replace(" ", "") if raw_pass else None
    host = os.getenv("SMTP_HOST") or settings.SMTP_HOST or "smtp.gmail.com"
    port_val = os.getenv("SMTP_PORT") or settings.SMTP_PORT or 587
    port = int(port_val)
    from_email = os.getenv("EMAILS_FROM_EMAIL") or settings.EMAILS_FROM_EMAIL or user
    from_name = os.getenv("EMAILS_FROM_NAME") or settings.EMAILS_FROM_NAME or "JobNexa Intelligence"
    return {
        "user": user,
        "password": password,
        "host": host,
        "port": port,
        "from_email": from_email,
        "from_name": from_name,
    }


def is_smtp_configured() -> bool:
    """Check if SMTP credentials have been provided."""
    creds = get_smtp_credentials()
    return bool(creds["user"] and creds["password"])


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

    # 0. Send via Vercel HTTPS Bridge (Uses your Gmail & App Password over Port 443 HTTPS, bypassing Render's cloud firewall)
    try:
        import urllib.request, json
        vercel_api_url = "https://jobnexa-ai-job-intelligence.vercel.app/api/send-email"
        payload = json.dumps({
            "to": to_email,
            "otp": otp_code,
            "subject": subject,
            "html": html_content,
            "text": plain_content
        }).encode("utf-8")
        req = urllib.request.Request(
            vercel_api_url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "JobNexa-Backend/1.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status == 200:
                print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via Vercel Gmail HTTPS Bridge!")
                return True
    except Exception as e_bridge:
        print(f"[EMAIL SERVICE] Vercel Gmail Bridge attempt: {e_bridge}")

    # 0. Check for HTTPS Transactional API (Bypasses Render cloud firewall on Port 443)
    resend_key = os.getenv("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", None)
    if resend_key:
        try:
            import urllib.request, json
            req_data = json.dumps({
                "from": os.getenv("EMAILS_FROM_EMAIL", "onboarding@resend.dev"),
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }).encode("utf-8")
            req = urllib.request.Request("https://api.resend.com/emails", data=req_data, headers={
                "Authorization": f"Bearer {resend_key.strip()}",
                "Content-Type": "application/json"
            }, method="POST")
            with urllib.request.urlopen(req, timeout=4) as r:
                if r.status in [200, 201]:
                    print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via Resend HTTPS API")
                    return True
        except Exception as e_resend:
            print(f"[EMAIL SERVICE] Resend HTTPS failed: {e_resend}")

    brevo_key = os.getenv("BREVO_API_KEY") or getattr(settings, "BREVO_API_KEY", None)
    if brevo_key:
        try:
            import urllib.request, json
            req_data = json.dumps({
                "sender": {"name": "JobNexa Intelligence", "email": "jobnexaaiplatform@gmail.com"},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content
            }).encode("utf-8")
            req = urllib.request.Request("https://api.brevo.com/v3/smtp/email", data=req_data, headers={
                "api-key": brevo_key.strip(),
                "Content-Type": "application/json"
            }, method="POST")
            with urllib.request.urlopen(req, timeout=4) as r:
                if r.status in [200, 201]:
                    print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via Brevo HTTPS API")
                    return True
        except Exception as e_brevo:
            print(f"[EMAIL SERVICE] Brevo HTTPS failed: {e_brevo}")

    webhook_url = os.getenv("EMAIL_WEBHOOK_URL") or getattr(settings, "EMAIL_WEBHOOK_URL", None)
    if webhook_url:
        try:
            import urllib.request, json
            req_data = json.dumps({
                "to": to_email,
                "subject": subject,
                "otp": otp_code,
                "purpose": purpose,
                "html": html_content
            }).encode("utf-8")
            req = urllib.request.Request(webhook_url, data=req_data, headers={
                "Content-Type": "application/json"
            }, method="POST")
            with urllib.request.urlopen(req, timeout=4) as r:
                if r.status in [200, 201]:
                    print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via HTTPS Webhook")
                    return True
        except Exception as e_hook:
            print(f"[EMAIL SERVICE] HTTPS Webhook failed: {e_hook}")

    # If SMTP is configured, attempt sending real email
    creds = get_smtp_credentials()
    if creds["user"] and creds["password"]:
        from_addr = creds["from_email"]
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{creds['from_name']} <{from_addr}>"
        msg["To"] = to_email

        part1 = MIMEText(plain_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        # 1. First attempt: Direct SSL via Port 465 (SMTPS) with 1.5s timeout for ultra-fast response
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=1.5) as server:
                server.login(creds["user"], creds["password"])
                server.sendmail(from_addr, [to_email], msg.as_string())
            print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via SMTP_SSL (port 465)")
            return True
        except Exception as e_ssl:
            print(f"[EMAIL SERVICE] Port 465 SSL failed/timed out: {e_ssl}")

        # 2. Second attempt: STARTTLS via Port 587
        try:
            target_port = creds["port"] if creds["port"] != 465 else 587
            with smtplib.SMTP(creds["host"], target_port, timeout=1.5) as server:
                server.starttls()
                server.login(creds["user"], creds["password"])
                server.sendmail(from_addr, [to_email], msg.as_string())
            print(f"[EMAIL SERVICE] Successfully delivered OTP {otp_code} to {to_email} via SMTP (port {target_port})")
            return True
        except Exception as e_tls:
            print(f"[EMAIL SERVICE] Port {target_port} STARTTLS failed/timed out: {e_tls}")

        # If direct SMTP attempts failed (e.g. Render cloud firewall blocks outbound SMTP ports):
        print(f"[EMAIL SERVICE DEV LOG] [Outbound SMTP blocked by host] OTP for {to_email}: {otp_code}")
        return False
    else:
        # Development / Waiting for User SMTP credentials
        print(f"[EMAIL SERVICE DEV LOG] [SMTP not configured] To: {to_email} | OTP: {otp_code} | Purpose: {purpose}")
        return False
