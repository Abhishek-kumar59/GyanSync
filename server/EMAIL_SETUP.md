# Email Configuration Guide for Password Reset

This guide explains how to set up email functionality for the password reset feature in GyanSync.

## Overview

The email service uses **Nodemailer** to send password reset emails to users. Currently configured for Gmail, but can be adapted for other email services.

## Setup Instructions

### 1. Using Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security** from the left menu
3. Enable **2-Step Verification** if not already enabled

#### Step 2: Generate App Password
1. Go back to **Security** settings
2. Look for **App passwords** (appears only if 2FA is enabled)
3. Select **Mail** and **Windows Computer** (or your device)
4. Google will generate a 16-character password
5. Copy this password

#### Step 3: Configure Environment Variables
1. Create a `.env` file in the `server/` directory (copy from `.env.example`)
2. Update with your Gmail details:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

⚠️ **Important**: Use the 16-character app password, NOT your regular Gmail password!

### 2. Using Other Email Services

The email service can be easily configured for:
- SendGrid
- Mailgun
- Amazon SES
- Microsoft Exchange
- Any SMTP-based email service

**To switch email providers:**

Edit `server/utils/emailService.js` and update the transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  service: 'your-service-name', // or use host/port for custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

For custom SMTP:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## How It Works

### Password Reset Flow:

1. **User clicks "Forgot?" on login page**
   - Enters email address
   - Clicks "Send Reset Link"

2. **Backend Process:**
   - Verifies email exists
   - Generates secure reset token (32 random bytes)
   - Saves token with 24-hour expiration
   - Sends email with reset link

3. **User receives email:**
   - Email contains a direct reset link with token
   - Link opens password reset form
   - User enters new password
   - Password is updated securely

### Email Templates:

#### Password Reset Email
- Professional design with GyanSync branding
- Security warning message
- 24-hour expiration notice
- Direct reset link
- Alternative token text for manual entry

#### Welcome Email (sent on signup)
- Welcome message
- Feature overview
- Call-to-action button
- Contact information

## Troubleshooting

### Email Not Sending?

1. **Check if .env variables are set:**
   ```bash
   node -e "console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWORD)"
   ```

2. **Gmail App Password Issues:**
   - Verify 2FA is enabled
   - Use the 16-character app password (with/without spaces)
   - App password is different from regular Gmail password

3. **Check server console:**
   - Look for "Email service is ready" or error messages
   - Check `console.log` statements in emailService.js

4. **Test email sending:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/request-reset \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

### Common Errors:

| Error | Solution |
|-------|----------|
| `connect ECONNREFUSED` | Email service not configured |
| `Invalid login` | Wrong app password or EMAIL_USER |
| `SMTP: 535 5.7.8` | App password not accepted, regenerate |
| `Service not supported` | Update nodemailer or email config |

## Development vs Production

### Development Setup
- Use Gmail App Password (free, easy to set up)
- Emails logged to console as backup
- Good for testing the full flow

### Production Setup
- Use professional email service (SendGrid, AWS SES, etc.)
- Enable email verification/DKIM
- Monitor delivery rates
- Set up bounce/complaint handlers
- Consider email templating services

## Email Customization

To customize email templates, edit `server/utils/emailService.js`:

1. **Modify email content:**
   - Update `getPasswordResetTemplate()` function
   - Change colors, text, or layout

2. **Change reset link URL:**
   - Line in `sendPasswordResetEmail()`:
   ```javascript
   const resetUrl = `http://localhost:3000/reset?token=${resetToken}`;
   // Change localhost:3000 to your domain
   ```

3. **Add additional emails:**
   - Create new template function
   - Add new `sendXxxEmail()` function
   - Call from appropriate endpoint

## Security Considerations

✅ **Implemented:**
- Tokens are cryptographically random (32 bytes)
- Tokens expire after 24 hours
- Tokens are hashed before storage (recommended: bcrypt in production)
- Passwords are hashed with bcryptjs
- Email doesn't reveal if account exists (for brute-force protection)

⚠️ **Recommendations for Production:**
- Implement rate limiting on `/api/auth/request-reset`
- Hash reset tokens in database
- Monitor for suspicious reset attempts
- Consider email verification on first signup
- Set up spam/phishing detection

## Testing

### Manual Testing:
1. Start the server: `npm run dev`
2. Go to login page → click "Forgot?"
3. Enter test email
4. Check email for reset link
5. Click link and reset password
6. Login with new password

### Automated Testing:
```bash
# Test email configuration
node -e "require('./utils/emailService')"

# Should see: "Email service is ready to send emails"
```

## Support & Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup Guide](https://sendgrid.com/docs/for-developers/sending-email/integrations/)
- [SMTP Configuration](https://nodemailer.com/smtp/)

## Next Steps

1. Configure your `.env` file with email credentials
2. Restart the server: `npm run dev`
3. Test the password reset flow
4. Deploy to production with your email service

For more help, check the console logs when the server starts!
