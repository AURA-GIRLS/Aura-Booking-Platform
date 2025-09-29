import nodemailer from 'nodemailer';
import { config } from '../config';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Send email verification
  async sendEmailVerification(email: string, token: string, fullName: string): Promise<void> {
    const verificationUrl = `${config.clientOrigin}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"AURA" <${config.smtpUser}>`,
      to: email,
      subject: 'Verify Your Email - AURA',
      html: this.getEmailVerificationTemplate(fullName, verificationUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email verification sent to ${email}`);
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw new Error('Failed to send email verification');
    }
  }

  // Send password reset email
  async sendPasswordReset(email: string, token: string, fullName: string): Promise<void> {
    const resetUrl = `${config.clientOrigin}/auth/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"AURA" <${config.smtpUser}>`,
      to: email,
      subject: 'Reset Your Password - AURA',
      html: this.getPasswordResetTemplate(fullName, resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Email verification template
  private getEmailVerificationTemplate(fullName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AURA!</h1>
            <p>Your Beauty Booking Platform</p>
          </div>
          <div class="content">
            <h2>Hi ${fullName}!</h2>
            <p>Thank you for registering with AURA. To complete your registration and start booking beauty services, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account with AURA, please ignore this email.</p>
            <p>&copy; 2024 AURA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Password reset template
  private getPasswordResetTemplate(fullName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>AURA - Your Beauty Booking Platform</p>
          </div>
          <div class="content">
            <h2>Hi ${fullName}!</h2>
            <p>We received a request to reset your password for your AURA account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p><strong>Note:</strong> This password reset link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AURA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send low balance alert to admin
  async sendLowBalanceAlert(
    adminEmail: string, 
    adminName: string, 
    requestType: 'refund' | 'withdrawal',
    requestedAmount: number,
    currentBalance: number,
    requestId: string
  ): Promise<void> {
    const mailOptions = {
      from: `"AURA System" <${config.smtpUser}>`,
      to: adminEmail,
      subject: `🚨 Low Balance Alert - ${requestType.toUpperCase()} Request Blocked`,
      html: this.getLowBalanceAlertTemplate(adminName, requestType, requestedAmount, currentBalance, requestId),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Low balance alert sent to admin ${adminEmail}`);
    } catch (error) {
      console.error('Error sending low balance alert:', error);
      throw new Error('Failed to send low balance alert');
    }
  }

  // Send refund success notification to user
  async sendRefundSuccessNotification(
    userEmail: string,
    userName: string,
    refundAmount: number,
    bookingId: string,
    serviceName?: string,
    payoutId?: string
  ): Promise<void> {
    const mailOptions = {
      from: `"AURA" <${config.smtpUser}>`,
      to: userEmail,
      subject: '✅ Refund Processed Successfully - AURA',
      html: this.getRefundSuccessTemplate(userName, refundAmount, bookingId, serviceName, payoutId),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Refund success notification sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending refund success notification:', error);
      throw new Error('Failed to send refund success notification');
    }
  }

  // Send withdrawal success notification to MUA
  async sendWithdrawalSuccessNotification(
    muaEmail: string,
    muaName: string,
    withdrawalAmount: number,
    muaId: string,
    payoutId?: string
  ): Promise<void> {
    const mailOptions = {
      from: `"AURA" <${config.smtpUser}>`,
      to: muaEmail,
      subject: '💰 Withdrawal Processed Successfully - AURA',
      html: this.getWithdrawalSuccessTemplate(muaName, withdrawalAmount, muaId, payoutId),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Withdrawal success notification sent to ${muaEmail}`);
    } catch (error) {
      console.error('Error sending withdrawal success notification:', error);
      throw new Error('Failed to send withdrawal success notification');
    }
  }

  // Refund success template
  private getRefundSuccessTemplate(
    userName: string,
    refundAmount: number,
    bookingId: string,
    serviceName?: string,
    payoutId?: string
  ): string {
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundAmount);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Processed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .details-box { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .amount { color: #27ae60; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .check-account-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Refund Processed</h1>
            <p>AURA - Your Beauty Booking Platform</p>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <div class="success-box">
              <h3 style="color: #155724; margin-top: 0;">🎉 Great News!</h3>
              <p>Your refund has been successfully processed and the money has been sent to your registered bank account.</p>
            </div>
            
            <div class="details-box">
              <h3 style="margin-top: 0;">Refund Details</h3>
              <div class="detail-item">
                <span class="detail-label">Refund Amount:</span>
                <span class="detail-value amount">${formattedAmount}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingId.substring(0, 8)}...</span>
              </div>
              ${serviceName ? `
              <div class="detail-item">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${serviceName}</span>
              </div>
              ` : ''}
              ${payoutId ? `
              <div class="detail-item">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${payoutId}</span>
              </div>
              ` : ''}
              <div class="detail-item">
                <span class="detail-label">Processed On:</span>
                <span class="detail-value">${new Date().toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <div class="check-account-box">
              <h3 style="color: #856404; margin-top: 0;">💳 Next Steps</h3>
              <p><strong>Please check your bank account:</strong></p>
              <ul>
                <li>The refund may take 1-3 business days to appear in your account</li>
                <li>Check your bank statement for the transaction</li>
                <li>The booking status has been updated in your account</li>
                <li>You can view the updated status in your booking history</li>
              </ul>
            </div>

            <p>If you don't see the refund in your account within 3 business days, please contact our support team.</p>
            <p>Thank you for using AURA!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>&copy; 2024 AURA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Withdrawal success template
  private getWithdrawalSuccessTemplate(
    muaName: string,
    withdrawalAmount: number,
    muaId: string,
    payoutId?: string
  ): string {
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawalAmount);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Processed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .details-box { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .amount { color: #3498db; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .check-wallet-box { background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Withdrawal Processed</h1>
            <p>AURA - Your Beauty Booking Platform</p>
          </div>
          <div class="content">
            <h2>Hi ${muaName}!</h2>
            <div class="success-box">
              <h3 style="color: #155724; margin-top: 0;">🎉 Withdrawal Successful!</h3>
              <p>Your withdrawal request has been successfully processed and the money has been sent to your registered bank account.</p>
            </div>
            
            <div class="details-box">
              <h3 style="margin-top: 0;">Withdrawal Details</h3>
              <div class="detail-item">
                <span class="detail-label">Withdrawal Amount:</span>
                <span class="detail-value amount">${formattedAmount}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">MUA ID:</span>
                <span class="detail-value">${muaId.substring(0, 8)}...</span>
              </div>
              ${payoutId ? `
              <div class="detail-item">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${payoutId}</span>
              </div>
              ` : ''}
              <div class="detail-item">
                <span class="detail-label">Processed On:</span>
                <span class="detail-value">${new Date().toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <div class="check-wallet-box">
              <h3 style="color: #0c5460; margin-top: 0;">👛 Important Information</h3>
              <p><strong>Please note the following:</strong></p>
              <ul>
                <li><strong>Your wallet balance has been reset to ₫0</strong></li>
                <li>The withdrawal may take 1-3 business days to appear in your bank account</li>
                <li>Check your bank statement for the transaction</li>
                <li>You can view your wallet status in the MUA dashboard</li>
                <li>Continue providing services to earn more and build your wallet balance</li>
              </ul>
            </div>

            <p>If you don't see the withdrawal in your account within 3 business days, please contact our support team.</p>
            <p>Thank you for being a valued MUA partner with AURA!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>&copy; 2024 AURA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Low balance alert template
  private getLowBalanceAlertTemplate(
    adminName: string, 
    requestType: 'refund' | 'withdrawal',
    requestedAmount: number,
    currentBalance: number,
    requestId: string
  ): string {
    const requestTypeTitle = requestType === 'refund' ? 'Refund' : 'Withdrawal';
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(requestedAmount);
    const formattedBalance = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBalance);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Low Balance Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stats-box { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .stat-label { font-weight: bold; color: #666; }
          .stat-value { color: #333; }
          .urgent { color: #e74c3c; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Low Balance Alert</h1>
            <p>AURA Admin Dashboard</p>
          </div>
          <div class="content">
            <h2>Hi ${adminName}!</h2>
            <div class="alert-box">
              <h3 style="color: #856404; margin-top: 0;">⚠️ ${requestTypeTitle} Request Blocked</h3>
              <p>A <strong>${requestType}</strong> request has been automatically blocked due to insufficient payout account balance.</p>
            </div>
            
            <div class="stats-box">
              <h3 style="margin-top: 0;">Request Details</h3>
              <div class="stat-item">
                <span class="stat-label">Request Type:</span>
                <span class="stat-value">${requestTypeTitle}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Request ID:</span>
                <span class="stat-value">${requestId}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Requested Amount:</span>
                <span class="stat-value urgent">${formattedAmount}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Current Balance:</span>
                <span class="stat-value urgent">${formattedBalance}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Shortfall:</span>
                <span class="stat-value urgent">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(requestedAmount - currentBalance)}</span>
              </div>
            </div>

            <div class="alert-box">
              <h3 style="color: #856404; margin-top: 0;">📋 Action Required</h3>
              <p><strong>Please top up the payout account balance as soon as possible to enable ${requestType} functionality.</strong></p>
              <ul>
                <li>Log into your PayOS payout account dashboard</li>
                <li>Add sufficient funds to cover pending ${requestType} requests</li>
                <li>Monitor the balance regularly to prevent future interruptions</li>
                <li>Consider setting up automatic balance alerts</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> This is an automated alert. The ${requestType} request will remain in queue until sufficient balance is available.
            </p>
          </div>
          <div class="footer">
            <p>This alert was sent automatically by AURA system on ${new Date().toLocaleString()}.</p>
            <p>&copy; 2024 AURA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}
