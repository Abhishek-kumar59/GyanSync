# 📧 Email Password Reset - Setup & Usage Guide

## 🎯 What's Implemented

### ✅ Complete Password Reset System with Email

```
┌─────────────────────────────────────────────────┐
│   FORGOT PASSWORD FLOW (Via Email)              │
├─────────────────────────────────────────────────┤
│ 1. User clicks "Forgot?" on login               │
│ 2. Enters email address                         │
│ 3. Backend generates secure token               │
│ 4. Email sent with reset link                   │
│ 5. User clicks link in email                    │
│ 6. Reset password form opens                    │
│ 7. User creates new password                    │
│ 8. Password updated in database                 │
│ 9. User logs in with new password ✅            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│   CHANGE PASSWORD FLOW (Logged In)              │
├─────────────────────────────────────────────────┤
│ 1. User goes to Settings → Security             │
│ 2. Clicks "Change Password"                     │
│ 3. Enters current password                      │
│ 4. Enters new password                          │
│ 5. Confirms new password                        │
│ 6. Password updated immediately ✅              │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Email Credentials

**For Gmail:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** → **Windows Computer**
3. Copy the **16-character password**

**For other services:**
- SendGrid: Get API key from dashboard
- AWS SES: Create credentials in AWS console
- See `EMAIL_SETUP.md` for more options

### Step 2: Create `.env` File

Create `server/.env`:
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Database
MONGODB_URI=mongodb://localhost:27017/gyansync

# Security
JWT_SECRET=your-secret-key-here

# Server
PORT=5000
```

### Step 3: Start Server

```bash
cd server
npm install  # If not already done
npm run dev
```

Expected output:
```
✅ Email service is ready to send emails
✅ MongoDB connected
✅ Server running on port 5000
```

### Step 4: Test It

1. Go to `http://localhost:3000`
2. Click "Forgot?" on login page
3. Enter your email
4. Check your email inbox
5. Click reset link
6. Create new password
7. Login with new password ✅

---

## 📧 Email Templates

### Password Reset Email

**What user receives:**

```
╔════════════════════════════════════════╗
║                                        ║
║        🔐 Password Reset Request       ║
║                                        ║
║────────────────────────────────────────║
║                                        ║
║ Hi there,                              ║
║                                        ║
║ We received a request to reset your    ║
║ GyanSync password. If you didn't       ║
║ make this request, ignore this email.  ║
║                                        ║
║  [RESET PASSWORD]  ← Click here        ║
║                                        ║
║ Or paste this link:                    ║
║ http://localhost:3000/reset?token=... ║
║                                        ║
║ ⚠️ This link expires in 24 hours       ║
║                                        ║
║ If you didn't request this, ignore.    ║
║                                        ║
║ © 2024 GyanSync                        ║
║                                        ║
╚════════════════════════════════════════╝
```

### Welcome Email

**Sent when user signs up:**

```
╔════════════════════════════════════════╗
║                                        ║
║    Welcome to GyanSync! 🎓             ║
║                                        ║
║────────────────────────────────────────║
║                                        ║
║ Hi Alex,                               ║
║                                        ║
║ Welcome to GyanSync!                   ║
║ Your account is all set up!            ║
║                                        ║
║ 📚 Organize Your Studies               ║
║ ⏱️ Focus & Productivity                 ║
║ 📊 Track Your Progress                 ║
║                                        ║
║  [START STUDYING NOW]                  ║
║                                        ║
║ Happy studying! 🚀                     ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🔧 Features

### Security
- ✅ Cryptographically random tokens (32 bytes)
- ✅ Tokens expire after 24 hours
- ✅ Passwords hashed with bcryptjs
- ✅ Current password verification
- ✅ No email enumeration (doesn't reveal if account exists)

### User Experience
- ✅ Clear confirmation messages
- ✅ Helpful error messages
- ✅ Professional HTML email templates
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Smooth animations

### Reliability
- ✅ Email service verification on startup
- ✅ Error logging for debugging
- ✅ Fallback to alternative services
- ✅ Token validation before password change

---

## 📁 New Files Created

### Email Service
```
server/
├── utils/
│   └── emailService.js          ← Email templates & sending logic
```

### Configuration
```
server/
├── .env.example                 ← Environment variables template
├── EMAIL_SETUP.md               ← Detailed setup guide
```

### Documentation
```
root/
├── QUICK_SETUP.md               ← 5-minute setup guide
├── ARCHITECTURE.md              ← Technical architecture
├── CHECKLIST.md                 ← Implementation checklist
└── IMPLEMENTATION_SUMMARY.md    ← Overview of changes
```

---

## 🎨 UI Components Modified

### Login Page - AuthView.tsx

**New "Forgot?" button:**
```
┌─────────────────────────────┐
│ Email Address               │
│ [_____________________]     │
│                             │
│ Password        [Forgot?]   │
│ [_____________________]     │
│                             │
│  [SIGN IN] →                │
└─────────────────────────────┘
```

**Forgot password mode:**
```
┌──────────────────────────────┐
│  Reset Password              │
│  Enter your email to receive │
│  a password reset link        │
│                              │
│ Email Address                │
│ [_____________________]      │
│                              │
│  [SEND RESET LINK] →         │
└──────────────────────────────┘
```

### Settings Page - SettingsView.tsx

**Security section:**
```
SECURITY
─────────────────────────────
  🔐 Change Password
     Secure your account...
                         [→]
  
  2️⃣  Two-Factor Auth
     Enabled via Authenticator   [✓]
```

**Change password modal:**
```
┌──────────────────────────────┐
│  Current Password            │
│  [_____________________]     │
│                              │
│  New Password                │
│  [_____________________]     │
│                              │
│  Confirm New Password        │
│  [_____________________]     │
│                              │
│  [UPDATE PASSWORD] [CANCEL]  │
└──────────────────────────────┘
```

---

## 🔌 API Endpoints

### Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Response:
# {
#   "message": "Password reset link has been sent to your email..."
# }
```

### Reset Password with Token
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
#   "token": "abc123def456...",
#   "newPassword": "NewPass123",
#   "confirmPassword": "NewPass123"
# }'

# Response:
# {
#   "message": "Password reset successfully"
# }
```

### Change Password (Logged In)
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
#   "currentPassword": "OldPass123",
#   "newPassword": "NewPass123",
#   "confirmPassword": "NewPass123"
# }'

# Response:
# {
#   "message": "Password changed successfully"
# }
```

---

## ✨ Environment Variables

```env
# Email Credentials
EMAIL_USER=your-email@gmail.com           # Your email
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx        # 16-char App Password

# Database
MONGODB_URI=mongodb://localhost:27017/gyansync

# Security  
JWT_SECRET=your_jwt_secret_key_here       # Keep secret!

# Server
PORT=5000                                  # Server port
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Email not sending | Check `.env` in `server/` folder, verify EMAIL_USER & EMAIL_PASSWORD |
| Gmail 535 error | Use 16-character App Password, not regular password |
| "Email service" error | Restart server after updating `.env` |
| No email received | Check spam folder, verify email is correct |
| Token expired | Tokens last 24 hours, request new reset |
| Password validation error | Min 6 chars, must match confirm |

See [EMAIL_SETUP.md](./server/EMAIL_SETUP.md) for detailed troubleshooting.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [QUICK_SETUP.md](./QUICK_SETUP.md) | 5-minute setup guide |
| [EMAIL_SETUP.md](./server/EMAIL_SETUP.md) | Detailed email configuration |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture & flows |
| [CHECKLIST.md](./CHECKLIST.md) | Implementation checklist |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Changes overview |

---

## ✅ Testing Checklist

### Forgot Password Flow
- [ ] Click "Forgot?" on login
- [ ] Enter valid email
- [ ] See confirmation message
- [ ] Check email inbox
- [ ] Click reset link
- [ ] Enter new password
- [ ] See success message
- [ ] Login with new password ✅

### Change Password
- [ ] Login to account
- [ ] Go to Settings
- [ ] Click "Change Password"
- [ ] Enter current password
- [ ] Enter new password
- [ ] Confirm password
- [ ] See success message ✅

### Error Handling
- [ ] Try non-existent email (no error leak)
- [ ] Try invalid token (proper error)
- [ ] Try mismatched passwords (error shown)
- [ ] Try short password (error shown)
- [ ] Try empty fields (validation)

---

## 🚀 Deployment Checklist

Before going to production:
- [ ] Update reset link URL (not localhost)
- [ ] Configure production email service
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Monitor email delivery
- [ ] Setup error logging
- [ ] Test email sending

---

## 🎉 You're All Set!

The password reset with email feature is **fully implemented and ready to use**!

### Quick Start:
1. Create `.env` file in `server/` folder
2. Add your email credentials
3. Run `npm run dev` in server folder
4. Test the "Forgot?" flow on login page
5. Done! ✅

---

**Questions?** See the documentation files or check `server/EMAIL_SETUP.md` for detailed help!
