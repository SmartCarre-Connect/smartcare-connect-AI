import smtplib
from email.message import EmailMessage
from loguru import logger
from app.core.config import settings


def send_email(subject: str, recipient: str, body: str) -> bool:
    """Send an email using SMTP settings from config. Returns True on success, False on failure."""
    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    from_addr = settings.EMAIL_FROM or username

    if not host or not username or not password:
        logger.warning("SMTP configuration incomplete. Skipping email send.")
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = from_addr
    msg['To'] = recipient
    msg.set_content(body)

    try:
        if settings.SMTP_USE_SSL:
            with smtplib.SMTP_SSL(host, port) as server:
                server.login(username, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port) as server:
                server.ehlo()
                if settings.SMTP_USE_TLS:
                    server.starttls()
                    server.ehlo()
                server.login(username, password)
                server.send_message(msg)
        logger.info(f"Email sent to {recipient}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")
        return False
