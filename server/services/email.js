const nodemailer = require('nodemailer');

// Create transporter - using Gmail for simplicity
// For production, use a proper email service like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// For development/testing, use Ethereal (fake SMTP)
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: '"Viebo 💕" <noreply@viebo.com>',
    to: email,
    subject: 'Verify your Viebo account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">Viebo 💕</h1>
          <p style="color: #64748b; margin-top: 8px;">Event-Based Dating</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 30px; color: white;">
          <h2 style="margin-top: 0; color: #f1f5f9;">Hey ${name}! 👋</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Thanks for signing up for Viebo! Please verify your email address to get started finding your perfect match at amazing events.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Or copy this link: <br/>
            <a href="${verificationUrl}" style="color: #00f5ff; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
          © 2026 Viebo. Find love at events that matter to you.
        </p>
      </div>
    `
  };

  try {
    // Use test transporter in development if no email credentials
    let emailTransporter = transporter;
    if (!process.env.EMAIL_USER) {
      emailTransporter = await createTestTransporter();
    }
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    
    // Log preview URL for Ethereal (development)
    if (!process.env.EMAIL_USER) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: '"Viebo 💕" <noreply@viebo.com>',
    to: email,
    subject: 'Reset your Viebo password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">Viebo 💕</h1>
          <p style="color: #64748b; margin-top: 8px;">Event-Based Dating</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 30px; color: white;">
          <h2 style="margin-top: 0; color: #f1f5f9;">Password Reset Request</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Hey ${name}, we received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Or copy this link: <br/>
            <a href="${resetUrl}" style="color: #00f5ff; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
          © 2026 Viebo. Find love at events that matter to you.
        </p>
      </div>
    `
  };

  try {
    let emailTransporter = transporter;
    if (!process.env.EMAIL_USER) {
      emailTransporter = await createTestTransporter();
    }
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    
    if (!process.env.EMAIL_USER) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
