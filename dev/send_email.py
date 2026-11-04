#!/usr/bin/env python3
"""Send one plaintext email over SMTP. Credentials come from the environment."""

from __future__ import annotations

import json
import os
import smtplib
import ssl
import sys
from email.message import EmailMessage


def env(name: str) -> str:
    return os.environ.get(name, "").strip()


def main() -> int:
    payload = json.load(sys.stdin)
    to = str(payload.get("to", "")).strip()
    subject = str(payload.get("subject", "")).strip()
    text = str(payload.get("text", ""))
    if "@" not in to or not subject:
        print("missing to/subject", file=sys.stderr)
        return 2

    host = env("SMTP_HOST")
    if not host:
        print("SMTP_HOST is not set", file=sys.stderr)
        return 2

    port = int(env("SMTP_PORT") or "587")
    user = env("SMTP_USER")
    password = env("SMTP_PASS")
    mail_from = env("EMAIL_FROM") or user
    if not mail_from:
        print("EMAIL_FROM or SMTP_USER is not set", file=sys.stderr)
        return 2

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = mail_from
    message["To"] = to
    message.set_content(text)

    context = ssl.create_default_context()
    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=20, context=context) as smtp:
            if user:
                smtp.login(user, password)
            smtp.send_message(message)
        return 0

    with smtplib.SMTP(host, port, timeout=20) as smtp:
        smtp.ehlo()
        smtp.starttls(context=context)
        smtp.ehlo()
        if user:
            smtp.login(user, password)
        smtp.send_message(message)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(error, file=sys.stderr)
        raise SystemExit(1)
