# 📬 Production SMTP Email Configuration Guide

This guide details how to configure real email sending for welcome follow-up messages and login security alerts on the OpenCraft platform.

If no variables are set, the application automatically falls back to **Ethereal Email** and prints a clickable email preview link directly to your backend console.

---

## ⚙️ 1. Required Environment Variables

To send real emails to standard email boxes, you must define the following variables:

- `SMTP_HOST`: The SMTP server host address (e.g. `smtp.resend.com`, `smtp.gmail.com`, `smtp.sendgrid.net`).
- `SMTP_PORT`: The connection port. Typically `587` (TLS) or `465` (SSL).
- `SMTP_SECURE`: Set to `true` if using port `465` (SSL). Otherwise, set to `false`.
- `SMTP_USER`: The username for authentication (e.g. API key or account email).
- `SMTP_PASS`: The password or credential secret.
- `SMTP_FROM`: The sender header format, e.g., `OpenCraft <noreply@yourdomain.com>`.

---

## 💻 2. Setup Configurations

### A. Local Development Setup
1. Open your [backend/.env](file:///d:/startup/backend/.env) file.
2. Add the SMTP credentials:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-specific-password"
   SMTP_FROM="OpenCraft <your-email@gmail.com>"
   ```
3. Restart your local backend server.

### B. Production Deployment (Railway)
1. Go to your **Railway Dashboard** and select your backend service.
2. Go to the **Variables** tab.
3. Click **Add Variable** and input the keys:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
4. Railway will automatically redeploy the backend container. Once live, all user signups and logins will trigger real production emails to their respective mailboxes!

---

## 🔐 3. Examples of Popular Providers

### ✉️ Gmail (Personal/Workspace)
- **SMTP_HOST**: `smtp.gmail.com`
- **SMTP_PORT**: `587`
- **SMTP_SECURE**: `false`
- **SMTP_USER**: Your full Gmail address.
- **SMTP_PASS**: An **App Password** generated from your Google Account settings (do not use your real master password).

### 🚀 Resend (Recommended for Developers)
- **SMTP_HOST**: `smtp.resend.com`
- **SMTP_PORT**: `465` (or `587`)
- **SMTP_SECURE**: `true` (if using 465)
- **SMTP_USER**: `resend` (literal word)
- **SMTP_PASS**: Your Resend API Key (`re_...`).
