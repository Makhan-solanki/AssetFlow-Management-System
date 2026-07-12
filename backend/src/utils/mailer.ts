import nodemailer from 'nodemailer';
import { env } from '../config/env';

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const smtpUser = env.SMTP_USER || process.env.SMTP_USER;
  const smtpPass = env.SMTP_PASS || process.env.SMTP_PASS;
  const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(env.SMTP_PORT || process.env.SMTP_PORT || '587');

  if (!smtpUser || !smtpPass) {
    console.warn(`⚠️ SMTP Credentials not configured in .env. Skipping real email delivery.`);
    console.log(`✉️ Simulated OTP for ${email}: ${code}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // Use secure connection for port 465, STARTTLS for others
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"AssetFlow Support" <${smtpUser}>`,
      to: email,
      subject: `AssetFlow - Verify Your Email Account (OTP: ${code})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
          <h2 style="color: #6366f1; text-align: center; margin-bottom: 24px;">Welcome to AssetFlow!</h2>
          <p style="color: #334155; font-size: 15px; line-height: 24px;">Thank you for registering. To complete your signup and verify your identity, please enter the following 6-digit verification code in the application:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #1e1b4b; letter-spacing: 6px; padding: 12px 24px; background-color: #f1f5f9; border-radius: 8px;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 20px; text-align: center; margin-top: 32px; border-t: 1px solid #f1f5f9; padding-top: 16px;">This OTP verification code is valid for 15 minutes. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Production verification email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send production verification email to ${email}:`, error);
    return false;
  }
}
