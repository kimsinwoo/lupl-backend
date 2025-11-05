const { prisma } = require('../config/database');

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code email
const sendVerificationEmail = async (email, code, type) => {
  try {
    // Check if email configuration is available
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailService = process.env.EMAIL_SERVICE;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    // Debug: Log environment variables (without password)
    console.log('\n🔍 Email Configuration Check:');
    console.log(`EMAIL_USER: ${emailUser ? emailUser.substring(0, 5) + '***' : 'NOT SET'}`);
    console.log(`EMAIL_PASSWORD: ${emailPassword ? '***SET***' : 'NOT SET'}`);
    console.log(`EMAIL_SERVICE: ${emailService || 'NOT SET'}`);
    console.log(`EMAIL_HOST: ${emailHost || 'NOT SET'}`);
    console.log(`EMAIL_PORT: ${emailPort || 'NOT SET'}`);
    console.log('');

    // If email is not configured, fallback to console log
    if (!emailUser || !emailPassword) {
      console.log('\n📧 ========== EMAIL VERIFICATION ==========');
      console.log(`To: ${email}`);
      console.log(`Type: ${type === 'findId' ? '아이디 찾기' : '비밀번호 변경'}`);
      console.log(`Verification Code: ${code}`);
      console.log('==========================================');
      console.log('⚠️ Email not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
      console.log('⚠️ Make sure .env file is in the backend root directory');
      console.log('⚠️ Make sure to restart the server after adding environment variables');
      console.log('⚠️ If password contains special characters, wrap it in quotes: EMAIL_PASSWORD="your@pass"');
      console.log('⚠️ For Gmail, use App Password, not regular password');
      console.log('');
      return true;
    }

    // Trim whitespace from environment variables
    const trimmedUser = emailUser.trim();
    const trimmedPassword = emailPassword.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any

    // Create transporter
    const nodemailer = require('nodemailer');
    
    // EMAIL_HOST가 있으면 커스텀 SMTP, 없으면 EMAIL_SERVICE 사용
    if (emailHost) {
      if (!emailPort) {
        throw new Error('EMAIL_PORT is required when EMAIL_HOST is set');
      }
      var transporterConfig = {
        host: emailHost,
        port: parseInt(emailPort),
        secure: parseInt(emailPort) === 465,
        auth: {
          user: trimmedUser,
          pass: trimmedPassword
        }
      };
    } else {
      if (!emailService) {
        throw new Error('EMAIL_SERVICE is required when EMAIL_HOST is not set');
      }
      var transporterConfig = {
        service: emailService,
        auth: {
          user: trimmedUser,
          pass: trimmedPassword
        }
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Email content
    const typeText = type === 'findId' ? '아이디 찾기' : '비밀번호 변경';
    const typeTextEn = type === 'findId' ? 'Find ID' : 'Reset Password';
    
    const subject = `[Lupl] ${typeText} 인증 코드`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .code-box {
            background-color: #5842FF;
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 5px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lupl 인증 코드</h1>
          </div>
          <p>안녕하세요,</p>
          <p>${typeText}를 위한 인증 코드입니다.</p>
          <div class="code-box">${code}</div>
          <p>이 인증 코드는 <strong>10분간 유효</strong>합니다.</p>
          <p>본인이 요청한 것이 아니라면 이 이메일을 무시해주세요.</p>
          <div class="footer">
            <p>© 2025 Lupl. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"Lupl" <${trimmedUser}>`,
      to: email,
      subject: subject,
      html: html,
      text: `${typeText} 인증 코드: ${code}\n이 코드는 10분간 유효합니다.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    
    // Check if it's a Gmail app password error
    if (error.code === 'EAUTH' && error.responseCode === 534) {
      console.error('\n❌ Gmail App Password Required!');
      console.error('❌ Gmail requires an App Password, not your regular password.');
      console.error('❌ Steps to fix:');
      console.error('   1. Go to https://myaccount.google.com/');
      console.error('   2. Security → Enable 2-Step Verification');
      console.error('   3. App passwords → Generate new password');
      console.error('   4. Use the 16-character app password in .env');
      console.error('   5. Restart the server\n');
    }
    
    // Fallback to console log if email sending fails
    console.log('\n📧 ========== EMAIL VERIFICATION (FALLBACK) ==========');
    console.log(`To: ${email}`);
    console.log(`Type: ${type === 'findId' ? '아이디 찾기' : '비밀번호 변경'}`);
    console.log(`Verification Code: ${code}`);
    console.log('====================================================\n');
    
    // Don't throw error, just return true so the code is saved
    // The user can see the code in console for now
    return true;
  }
};

// Create and send verification code
const sendVerificationCode = async (email, type) => {
  try {
    // Check if EmailVerification model exists
    if (!prisma.emailVerification) {
      console.error('❌ EmailVerification model not found. Please run: npx prisma migrate dev --name add_email_verification');
      throw new Error('EmailVerification table does not exist. Please run database migration.');
    }

    // Delete any existing unverified codes for this email and type
    try {
      await prisma.emailVerification.deleteMany({
        where: {
          email,
          type,
          verified: false
        }
      });
    } catch (deleteError) {
      // Table might not exist yet, continue anyway
      console.warn('⚠️ Could not delete old verifications:', deleteError.message);
    }
    
    // Generate code
    const code = generateVerificationCode();
    
    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Save to database
    try {
      await prisma.emailVerification.create({
        data: {
          email,
          code,
          type,
          expiresAt
        }
      });
    } catch (createError) {
      console.error('❌ Failed to create email verification:', createError);
      if (createError.code === 'P2001' || createError.message.includes('does not exist')) {
        throw new Error('EmailVerification table does not exist. Please run: npx prisma migrate dev --name add_email_verification');
      }
      throw createError;
    }
    
    // Send email
    await sendVerificationEmail(email, code, type);
    
    return code;
  } catch (error) {
    console.error('❌ Error in sendVerificationCode:', error);
    throw error;
  }
};

// Verify code
const verifyCode = async (email, code, type) => {
  try {
    if (!prisma.emailVerification) {
      throw new Error('EmailVerification table does not exist. Please run database migration.');
    }

    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        type,
        verified: false,
        expiresAt: {
          gte: new Date() // Not expired
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!verification) {
      throw new Error('Invalid or expired verification code');
    }
    
    // Mark as verified
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });
    
    // Clean up old verifications
    try {
      await prisma.emailVerification.deleteMany({
        where: {
          email,
          expiresAt: {
            lt: new Date()
          }
        }
      });
    } catch (cleanupError) {
      // Ignore cleanup errors
      console.warn('⚠️ Could not clean up old verifications:', cleanupError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in verifyCode:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode
};

