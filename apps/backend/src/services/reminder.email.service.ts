import sgMail from '@sendgrid/mail';
import { config } from '../config';

export class ReminderEmailService {
  constructor() {
    sgMail.setApiKey(config.sendgridApiKey);
  }

  // Send 24h reminder before booking
  async send24hReminder(opts: {
    to: string;
    customerName?: string;
    muaName?: string;
    serviceName?: string;
    bookingDate: Date;
    address?: string;
  }): Promise<void> {
    const { to, customerName = 'Khách hàng', muaName = 'Makeup Artist', serviceName = 'Dịch vụ', bookingDate, address } = opts;
    const subject = '⏰ Nhắc nhở: Lịch hẹn của bạn sắp diễn ra trong 24 giờ - AURA';
    const html = this.get24hTemplate(customerName, muaName, serviceName, bookingDate, address);
    
    try {
      await this.send({ to, subject, html });
      console.log(`✅ 24h reminder email sent to ${to}`);
    } catch (error: any) {
      console.error('❌ Error sending 24h reminder email:', error.response?.body || error);
      throw new Error('Failed to send 24h reminder email');
    }
  }

  // Send 1h reminder before booking
  async send1hReminder(opts: {
    to: string;
    customerName?: string;
    muaName?: string;
    serviceName?: string;
    bookingDate: Date;
    address?: string;
  }): Promise<void> {
    const { to, customerName = 'Khách hàng', muaName = 'Makeup Artist', serviceName = 'Dịch vụ', bookingDate, address } = opts;
    const subject = '🔔 Nhắc nhở khẩn: Lịch hẹn của bạn sắp bắt đầu trong 1 giờ - AURA';
    const html = this.get1hTemplate(customerName, muaName, serviceName, bookingDate, address);
    
    try {
      await this.send({ to, subject, html });
      console.log(`✅ 1h reminder email sent to ${to}`);
    } catch (error: any) {
      console.error('❌ Error sending 1h reminder email:', error.response?.body || error);
      throw new Error('Failed to send 1h reminder email');
    }
  }

  // Send booking cancellation notification
  async sendCancelNotice(opts: {
    to: string;
    customerName?: string;
    muaName?: string;
    serviceName?: string;
    bookingDate?: Date;
    reason?: string;
  }): Promise<void> {
    const { to, customerName = 'Khách hàng', muaName = 'Makeup Artist', serviceName = 'Dịch vụ', bookingDate, reason } = opts;
    const subject = '❌ Thông báo hủy lịch hẹn - AURA';
    const html = this.getCancelTemplate(customerName, muaName, serviceName, bookingDate, reason);
    
    try {
      await this.send({ to, subject, html });
      console.log(`✅ Cancellation email sent to ${to}`);
    } catch (error: any) {
      console.error('❌ Error sending cancellation email:', error.response?.body || error);
      throw new Error('Failed to send cancellation email');
    }
  }

  // Send booking update notification
  async sendUpdateNotice(opts: {
    to: string;
    customerName?: string;
    muaName?: string;
    serviceName?: string;
    oldDate?: Date;
    newDate?: Date;
    address?: string;
  }): Promise<void> {
    const { to, customerName = 'Khách hàng', muaName = 'Makeup Artist', serviceName = 'Dịch vụ', oldDate, newDate, address } = opts;
    const subject = '🔄 Thông báo thay đổi lịch hẹn - AURA';
    const html = this.getUpdateTemplate(customerName, muaName, serviceName, oldDate, newDate, address);
    
    try {
      await this.send({ to, subject, html });
      console.log(`✅ Update email sent to ${to}`);
    } catch (error: any) {
      console.error('❌ Error sending update email:', error.response?.body || error);
      throw new Error('Failed to send update email');
    }
  }

  // Private method to send email via SendGrid
  private async send({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
    // Tạo text version từ HTML (đơn giản)
    const text = html
      .replace(/<[^>]*>/g, '') // Loại bỏ HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const msg = {
      to,
      from: {
        name: 'AURA Beauty Services',
        email: config.smtpUser,
      },
      replyTo: config.smtpUser, // Cho phép khách hàng reply
      subject,
      html,
      text, // Text version cho email client không hỗ trợ HTML
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false },
      },
      // Thêm headers chống spam
      headers: {
        'X-Entity-Ref-ID': `booking-reminder-${Date.now()}`,
      },
    };

    await sgMail.send(msg);
  }

  // Helper to format date/time
  private formatDateTime(dt?: Date): string {
    if (!dt) return '';
    try {
      return new Date(dt).toLocaleString('vi-VN', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '';
    }
  }

  // Template for 24h reminder
  private get24hTemplate(customerName: string, muaName: string, serviceName: string, bookingDate: Date, address?: string): string {
    const when = this.formatDateTime(bookingDate);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f5f5f5; margin: 0; padding: 0; }
          .email-wrapper { width: 100%; background-color: #f5f5f5; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500; }
          .message { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.8; }
          .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 4px; }
          .info-label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .info-value { font-size: 16px; color: #2c3e50; margin-bottom: 15px; font-weight: 500; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .highlight-text { color: #856404; font-weight: 500; margin: 0; }
          .footer { background: #34495e; color: #ecf0f1; padding: 30px; text-align: center; font-size: 14px; }
          .footer p { margin: 5px 0; }
          .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>Nhắc nhở lịch hẹn</h1>
            </div>
            <div class="content">
              <div class="greeting">Kính gửi ${customerName},</div>
              <div class="message">
                Đây là thông báo nhắc nhở về lịch hẹn sắp tới của quý khách tại AURA. Lịch hẹn của quý khách sẽ diễn ra trong vòng 24 giờ tới.
              </div>
              <div class="highlight">
                <p class="highlight-text">Vui lòng lưu ý thời gian và chuẩn bị sẵn sàng cho buổi hẹn.</p>
              </div>
              <div class="info-box">
                <div class="info-label">Makeup Artist</div>
                <div class="info-value">${muaName}</div>
                <div class="divider"></div>
                <div class="info-label">Dịch vụ</div>
                <div class="info-value">${serviceName}</div>
                <div class="divider"></div>
                <div class="info-label">Thời gian</div>
                <div class="info-value">${when}</div>
                ${address ? `
                <div class="divider"></div>
                <div class="info-label">Địa điểm</div>
                <div class="info-value">${address}</div>
                ` : ''}
              </div>
              <div class="message">
                Nếu quý khách cần thay đổi hoặc có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi sớm nhất có thể để được hỗ trợ.
              </div>
            </div>
            <div class="footer">
              <p><strong>AURA Beauty Services</strong></p>
              <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>
              <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">&copy; 2024 AURA. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template for 1h reminder
  private get1hTemplate(customerName: string, muaName: string, serviceName: string, bookingDate: Date, address?: string): string {
    const when = this.formatDateTime(bookingDate);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f5f5f5; margin: 0; padding: 0; }
          .email-wrapper { width: 100%; background-color: #f5f5f5; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500; }
          .message { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.8; }
          .info-box { background: #f8f9fa; border-left: 4px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 4px; }
          .info-label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .info-value { font-size: 16px; color: #2c3e50; margin-bottom: 15px; font-weight: 500; }
          .urgent-box { background: #fff3cd; padding: 20px; border-radius: 4px; margin: 25px 0; border: 2px solid #ffc107; text-align: center; }
          .urgent-text { color: #856404; font-weight: 600; font-size: 18px; margin: 0; }
          .footer { background: #34495e; color: #ecf0f1; padding: 30px; text-align: center; font-size: 14px; }
          .footer p { margin: 5px 0; }
          .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>Nhắc nhở khẩn cấp</h1>
            </div>
            <div class="content">
              <div class="greeting">Kính gửi ${customerName},</div>
              <div class="urgent-box">
                <p class="urgent-text">LỊCH HẸN CỦA QUÝ KHÁCH SẼ BẮT ĐẦU TRONG 1 GIờ NỮA</p>
              </div>
              <div class="message">
                Đây là thông báo nhắc nhở khẩn cấp về lịch hẹn sắp diễn ra của quý khách. Vui lòng chuẩn bị và di chuyển đến địa điểm để đảm bảo đúng giờ.
              </div>
              <div class="info-box">
                <div class="info-label">Makeup Artist</div>
                <div class="info-value">${muaName}</div>
                <div class="divider"></div>
                <div class="info-label">Dịch vụ</div>
                <div class="info-value">${serviceName}</div>
                <div class="divider"></div>
                <div class="info-label">Thời gian</div>
                <div class="info-value">${when}</div>
                ${address ? `
                <div class="divider"></div>
                <div class="info-label">Địa điểm</div>
                <div class="info-value">${address}</div>
                ` : ''}
              </div>
              <div class="message">
                Chúng tôi rất mong được phục vụ quý khách. Chúc quý khách có trải nghiệm tuyệt vời!
              </div>
            </div>
            <div class="footer">
              <p><strong>AURA Beauty Services</strong></p>
              <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>
              <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">&copy; 2024 AURA. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template for cancellation
  private getCancelTemplate(customerName: string, muaName: string, serviceName: string, bookingDate?: Date, reason?: string): string {
    const when = this.formatDateTime(bookingDate);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f5f5f5; margin: 0; padding: 0; }
          .email-wrapper { width: 100%; background-color: #f5f5f5; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500; }
          .message { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.8; }
          .info-box { background: #f8f9fa; border-left: 4px solid #dc2626; padding: 25px; margin: 30px 0; border-radius: 4px; }
          .info-label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .info-value { font-size: 16px; color: #2c3e50; margin-bottom: 15px; font-weight: 500; }
          .reason-box { background: #fee; padding: 20px; border-radius: 4px; margin: 25px 0; border-left: 4px solid #dc2626; }
          .reason-label { font-size: 12px; color: #991b1b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
          .reason-text { color: #7f1d1d; font-size: 15px; margin: 0; }
          .footer { background: #34495e; color: #ecf0f1; padding: 30px; text-align: center; font-size: 14px; }
          .footer p { margin: 5px 0; }
          .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>Thông báo hủy lịch hẹn</h1>
            </div>
            <div class="content">
              <div class="greeting">Kính gửi ${customerName},</div>
              <div class="message">
                Chúng tôi xin thông báo rằng lịch hẹn của quý khách tại AURA đã được hủy. Chúng tôi rất tiếc về sự bất tiện này.
              </div>
              <div class="info-box">
                <div class="info-label">Makeup Artist</div>
                <div class="info-value">${muaName}</div>
                <div class="divider"></div>
                <div class="info-label">Dịch vụ</div>
                <div class="info-value">${serviceName}</div>
                ${when ? `
                <div class="divider"></div>
                <div class="info-label">Thời gian đã hủy</div>
                <div class="info-value">${when}</div>
                ` : ''}
              </div>
              ${reason ? `
              <div class="reason-box">
                <div class="reason-label">Lý do hủy</div>
                <p class="reason-text">${reason}</p>
              </div>
              ` : ''}
              <div class="message">
                Nếu quý khách có bất kỳ thắc mắc nào hoặc muốn đặt lịch hẹn mới, vui lòng liên hệ với bộ phận chăm sóc khách hàng của chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ quý khách.
              </div>
              <div class="message">
                Chúng tôi hy vọng được phục vụ quý khách trong tương lai gần.
              </div>
            </div>
            <div class="footer">
              <p><strong>AURA Beauty Services</strong></p>
              <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>
              <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">&copy; 2024 AURA. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template for update
  private getUpdateTemplate(customerName: string, muaName: string, serviceName: string, oldDate?: Date, newDate?: Date, address?: string): string {
    const oldWhen = this.formatDateTime(oldDate);
    const newWhen = this.formatDateTime(newDate);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f5f5f5; margin: 0; padding: 0; }
          .email-wrapper { width: 100%; background-color: #f5f5f5; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500; }
          .message { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.8; }
          .info-box { background: #f8f9fa; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 4px; }
          .info-label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .info-value { font-size: 16px; color: #2c3e50; margin-bottom: 15px; font-weight: 500; }
          .change-box { background: #dbeafe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #60a5fa; }
          .change-label { font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .change-value { color: #1e3a8a; font-size: 15px; margin: 0; font-weight: 500; }
          .new-time-box { background: #d1fae5; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #10b981; }
          .new-time-label { font-size: 12px; color: #065f46; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .new-time-value { color: #064e3b; font-size: 15px; margin: 0; font-weight: 500; }
          .footer { background: #34495e; color: #ecf0f1; padding: 30px; text-align: center; font-size: 14px; }
          .footer p { margin: 5px 0; }
          .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>Thông báo cập nhật lịch hẹn</h1>
            </div>
            <div class="content">
              <div class="greeting">Kính gửi ${customerName},</div>
              <div class="message">
                Chúng tôi xin thông báo rằng thông tin lịch hẹn của quý khách tại AURA đã được cập nhật. Vui lòng xem chi tiết bên dưới.
              </div>
              <div class="info-box">
                <div class="info-label">Makeup Artist</div>
                <div class="info-value">${muaName}</div>
                <div class="divider"></div>
                <div class="info-label">Dịch vụ</div>
                <div class="info-value">${serviceName}</div>
                ${address ? `
                <div class="divider"></div>
                <div class="info-label">Địa điểm</div>
                <div class="info-value">${address}</div>
                ` : ''}
              </div>
              ${oldWhen ? `
              <div class="change-box">
                <div class="change-label">Thời gian cũ</div>
                <p class="change-value">${oldWhen}</p>
              </div>
              ` : ''}
              ${newWhen ? `
              <div class="new-time-box">
                <div class="new-time-label">Thời gian mới</div>
                <p class="new-time-value">${newWhen}</p>
              </div>
              ` : ''}
              <div class="message">
                Vui lòng lưu ý thời gian mới và chuẩn bị cho lịch hẹn của quý khách. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
              </div>
            </div>
            <div class="footer">
              <p><strong>AURA Beauty Services</strong></p>
              <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>
              <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">&copy; 2024 AURA. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}