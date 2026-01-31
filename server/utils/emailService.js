const nodemailer = require('nodemailer');

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}`;

// Configure your email service here
// For Gmail: https://support.google.com/accounts/answer/185833
// For other services, update the config accordingly

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
    console.error('Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env');
  } else {
    console.log('✅ Email service is ready to send emails');
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${API_URL}/reset?token=${resetToken}`;
    
    const mailOptions = {
      // from: process.env.EMAIL_USER,
      from: 'Gyan-Sync',
      to: email,
      subject: 'GyanSync - Password Reset Request',
      html: getPasswordResetTemplate(resetUrl)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  }
};

const getPasswordResetTemplate = (resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D265A 0%, #2A367A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .reset-button { display: inline-block; background: #F48B29; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .reset-button:hover { background: #D16C1D; }
          .reset-link { color: #1D265A; word-break: break-all; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
          .warning { color: #d32f2f; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>We received a request to reset your GyanSync password. If you didn't make this request, you can ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <center>
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p class="reset-link">${resetUrl}</p>
            
            <p><strong>Important:</strong> This reset link will expire in 24 hours.</p>
            
            <div class="warning">
              ⚠️ If you did not request a password reset, please ignore this email and your password will remain unchanged. If you believe your account is at risk, please contact our support team immediately.
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} GyanSync. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      // from: process.env.EMAIL_USER,
      from: 'Gyan-Sync',
      to: email,
      subject: 'Welcome to GyanSync - Your Account is Ready!',
      html: getWelcomeTemplate(name)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};

const getWelcomeTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D265A 0%, #2A367A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #F48B29; }
          .feature-title { font-weight: bold; color: #1D265A; }
          .cta-button { display: inline-block; background: #F48B29; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .cta-button:hover { background: #D16C1D; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to GyanSync! 🎓</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Welcome to GyanSync! We're excited to have you join our community of students.</p>
            
            <p><strong>Your account is all set up and ready to use!</strong></p>
            
            <p>Here's what you can do with GyanSync:</p>
            
            <div class="feature">
              <div class="feature-title">📚 Organize Your Studies</div>
              <p>Create and manage study sessions, track your progress, and organize resources by subject.</p>
            </div>
            
            <div class="feature">
              <div class="feature-title">⏱️ Focus & Productivity</div>
              <p>Use our smart timetable and focus timer to maximize your study efficiency.</p>
            </div>
            
            <div class="feature">
              <div class="feature-title">📊 Track Your Progress</div>
              <p>Monitor your study streak, statistics, and achievements to stay motivated.</p>
            </div>
            
            <center>
              <a href="${API_URL}" class="cta-button">Start Studying Now</a>
            </center>
            
            <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
            
            <p>Happy studying! 🚀</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} GyanSync. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
