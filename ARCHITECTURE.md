# Password Reset - Technical Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER FORGOT PASSWORD                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Frontend: AuthView Component       │
        │  - Shows "Forgot Password" form     │
        │  - User enters email                │
        │  - Mode: 'forgot'                   │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────────┐
        │  POST /api/auth/request-reset                   │
        │  Body: { email: "user@example.com" }            │
        └─────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Backend: server.js                 │
        │  1. Find user by email              │
        │  2. Generate random token (32 bytes)│
        │  3. Set expiration (24 hours)       │
        │  4. Save to database                │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  emailService.sendPasswordResetEmail│
        │  1. Create HTML email template      │
        │  2. Add reset link with token       │
        │  3. Send via Nodemailer (Gmail)     │
        │  4. Log messageId                   │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  User Email Inbox                       │
        │  ┌───────────────────────────────────┐  │
        │  │ Subject: Password Reset Request   │  │
        │  │ Body:                             │  │
        │  │ Reset link: [CLICK HERE]          │  │
        │  │ Token: abc123xyz789               │  │
        │  │ Expires in: 24 hours              │  │
        │  └───────────────────────────────────┘  │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Frontend: "Check Your Email" Page  │
        │  - Confirmation message             │
        │  - "Back to Login" button            │
        │  - Mode: 'forgot-sent'              │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  User Clicks Reset Link in Email    │
        │  URL: /reset?token=abc123xyz789     │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Frontend: Reset Password Form      │
        │  - Shows token field                │
        │  - Shows new password field         │
        │  - Shows confirm password field     │
        │  - Mode: 'reset'                    │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  User Enters New Password            │
        │  - Validates: min 6 characters       │
        │  - Confirms: both passwords match    │
        │  - Clicks "Reset Password"           │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────────┐
        │  POST /api/auth/reset-password              │
        │  Body: {                                     │
        │    token: "abc123xyz789",                    │
        │    newPassword: "NewPass123",                │
        │    confirmPassword: "NewPass123"             │
        │  }                                           │
        └──────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Backend Validation                  │
        │  1. Passwords match? ✓               │
        │  2. Password >= 6 chars? ✓           │
        │  3. Token is valid? ✓                │
        │  4. Token not expired? ✓             │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Database Update                     │
        │  1. Hash new password (bcryptjs)     │
        │  2. Update user.password             │
        │  3. Clear resetToken = null          │
        │  4. Clear resetTokenExpires = null   │
        │  5. Save to database                 │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Response: Success Message           │
        │  "Password reset successfully!"      │
        │  Redirect to login (after 2 sec)     │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  User Logs In with New Password      │
        │  POST /api/auth/login                │
        │  - Email: user@example.com           │
        │  - Password: NewPass123              │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  ✅ Login Successful                 │
        │  - User authenticated                │
        │  - Token issued                      │
        │  - Redirected to dashboard           │
        └──────────────────────────────────────┘
```

## Change Password Flow (Logged-In Users)

```
┌─────────────────────────────────────────────────────────────┐
│              USER WANTS TO CHANGE PASSWORD                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Settings → Security Section        │
        │  Click "Change Password" Button      │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Modal Form Opens                   │
        │  - Current Password (required)       │
        │  - New Password (required)           │
        │  - Confirm Password (required)       │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────────┐
        │  POST /api/auth/change-password             │
        │  Headers: Authorization: Bearer {token}      │
        │  Body: {                                     │
        │    currentPassword: "OldPass123",            │
        │    newPassword: "NewPass123",                │
        │    confirmPassword: "NewPass123"             │
        │  }                                           │
        └──────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Backend Verification                │
        │  1. Get user from token              │
        │  2. Validate currentPassword         │
        │  3. Validate new passwords match     │
        │  4. Validate password length         │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Update Password                     │
        │  1. Hash new password                │
        │  2. Update user.password             │
        │  3. Save to database                 │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  ✅ Success Message Shown            │
        │  "Password changed successfully!"    │
        │  Form closes                         │
        └──────────────────────────────────────┘
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypted),
  
  // Password Reset Fields
  resetToken: String || null,        // Random 32-byte hex
  resetTokenExpires: Date || null,   // Expires in 24 hours
  
  // Other fields...
  isAdmin: Boolean,
  avatar: String,
  banner: String,
  major: String,
  location: String,
  streak: Number,
  lastStudyDate: String,
  totalStudyMinutes: Number,
  bio: String,
  joinDate: String,
  lastActive: Date,
  createdAt: Date
}
```

## Email Templates

### Password Reset Email Structure
```html
┌─────────────────────────────────────┐
│         Header (Dark Blue)          │
│      🔐 Password Reset Request      │
└─────────────────────────────────────┘
         │
         │ Greeting
         │ "Hi there,"
         │
         │ Body Message
         │ "We received a request..."
         │
         │ [RESET PASSWORD] Button ← Orange/Gold
         │
         │ Or copy this link:
         │ http://localhost:3000/reset?token=...
         │
         │ ⚠️ Security Warning
         │ "If you didn't request this..."
         │
         │ Footer
         │ © 2024 GyanSync
└─────────────────────────────────────┘
```

## Security Measures

### Token Generation
```javascript
const crypto = require('crypto');
const resetToken = crypto.randomBytes(32).toString('hex');
// Example: a3f5e9c2b8d1f4a6e7c9f2d4b1a8e5c3f6a9d2b5e8c1f4a7d0e3b6c9f2a5

// Stored in database with expiration
resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
// Token valid for 24 hours
```

### Password Hashing
```javascript
// Before storing
const hashedPassword = await bcrypt.hash(password, 12);

// Before comparing
const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
```

### Token Validation
```javascript
// Check token exists and hasn't expired
const user = await User.findOne({
  resetToken: token,
  resetTokenExpires: { $gt: new Date() }  // Greater than now
});
```

## Endpoints Summary

### 1. Request Password Reset
```
POST /api/auth/request-reset
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response (Success):
{
  "message": "Password reset link has been sent to your email..."
}

Response (Non-existent Email):
{
  "message": "If an account with this email exists..."
}
```

### 2. Reset Password with Token
```
POST /api/auth/reset-password
Content-Type: application/json

Request:
{
  "token": "a3f5e9c2b8d1f4a6e7c9f2d4b1a8e5c3...",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}

Response (Success):
{
  "message": "Password reset successfully"
}

Response (Error):
{
  "message": "Invalid or expired reset token"
}
```

### 3. Change Password (Logged In)
```
POST /api/auth/change-password
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

Request:
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}

Response (Success):
{
  "message": "Password changed successfully"
}

Response (Error):
{
  "message": "Current password is incorrect"
}
```

## Email Service Configuration

### Nodemailer Setup
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // your-email@gmail.com
    pass: process.env.EMAIL_PASSWORD   // 16-char app password
  }
});

// Send email
const info = await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: recipientEmail,
  subject: 'GyanSync - Password Reset Request',
  html: emailTemplate
});
```

## Error Handling

### Frontend Errors
- Network error → "An error occurred"
- Invalid credentials → "Current password is incorrect"
- Password mismatch → "Passwords do not match"
- Weak password → "Password must be at least 6 characters"

### Backend Errors
- No token → "No token provided"
- Invalid token → "Invalid or expired reset token"
- User not found → Don't reveal (security)
- Email failed → Log but don't expose to user

## Testing Checklist

- [ ] Request reset with valid email
- [ ] Check email received
- [ ] Click reset link in email
- [ ] Reset password with new value
- [ ] Login with new password
- [ ] Change password from settings
- [ ] Invalid token handling
- [ ] Expired token handling
- [ ] Password validation (empty, too short)
- [ ] Confirmation email sent on signup
