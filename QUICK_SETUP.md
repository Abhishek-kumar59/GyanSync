# Email Setup Quick Reference

## 🚀 5-Minute Setup

### Step 1: Get Gmail App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Select Mail → Windows Computer
3. Copy the 16-character password

### Step 2: Configure Environment
Create `server/.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
MONGODB_URI=mongodb://localhost:27017/gyansync
JWT_SECRET=your-secret
PORT=5000
```

### Step 3: Install & Start
```bash
cd server
npm install
npm run dev
```

### Step 4: Test
1. Go to http://localhost:3000
2. Click "Forgot?" on login
3. Enter your email
4. Check email for reset link
5. Done! ✅

---

## Email Features

| Feature | Status | Usage |
|---------|--------|-------|
| Password Reset | ✅ Ready | "Forgot?" link on login |
| Change Password | ✅ Ready | Settings → Security |
| Welcome Email | ✅ Ready | Sent on signup |
| Email Templates | ✅ Ready | Professional HTML |
| Token Expiration | ✅ Ready | 24 hours |

---

## Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com          # Gmail address
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx       # 16-char App Password

# Database
MONGODB_URI=mongodb://localhost:27017/gyansync

# Security
JWT_SECRET=your-secret-key

# Server
PORT=5000
```

---

## Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/request-reset` | POST | Send reset email |
| `/api/auth/reset-password` | POST | Reset with token |
| `/api/auth/change-password` | POST | Change logged-in user |

---

## Frontend Integration

### Login Page
- Click "Forgot?" button
- Shows email input form
- Sends reset email
- Shows confirmation message

### Settings Page
- Security section
- "Change Password" button
- Modal form for password change
- Verification required

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check `.env` file in server folder |
| 535 error | Gmail: Use App Password, not regular password |
| No email service message | Restart server after .env changes |
| Email in spam | Use professional service (SendGrid, AWS SES) |

---

## File Locations

```
server/
├── utils/
│   └── emailService.js          ← Email templates & config
├── .env                          ← Your credentials (not in git)
├── .env.example                  ← Template
├── EMAIL_SETUP.md                ← Detailed guide
└── server.js                     ← Email endpoints

client/
├── components/
│   ├── AuthView.tsx              ← Forgot/reset UI
│   └── SettingsView.tsx          ← Change password UI
└── services/
    └── authService.ts            ← API calls
```

---

## API Examples

### Request Reset
```bash
curl -X POST http://localhost:5000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123...",
    "newPassword": "NewPass123",
    "confirmPassword": "NewPass123"
  }'
```

### Change Password (requires token)
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass123",
    "confirmPassword": "NewPass123"
  }'
```

---

## Next Steps

- [ ] Set up `.env` file
- [ ] Verify email service with `npm run dev`
- [ ] Test password reset flow
- [ ] Test change password feature
- [ ] Customize email templates (optional)
- [ ] Deploy to production

---

For more details, see [EMAIL_SETUP.md](./server/EMAIL_SETUP.md)
