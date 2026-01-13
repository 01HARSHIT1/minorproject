import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import twilio from 'twilio';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;
  private twilioClient: twilio.Twilio | null = null;
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
    this.initializeTwilio();
    this.initializeEmail();
  }

  private initializeFirebase() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      if (projectId) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey: this.configService
              .get<string>('FIREBASE_PRIVATE_KEY')
              ?.replace(/\\n/g, '\n'),
            clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          }),
        });
      }
    } catch (error) {
      this.logger.warn('Firebase not initialized:', error);
    }
  }

  private initializeTwilio() {
    try {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      if (accountSid && authToken) {
        this.twilioClient = twilio(accountSid, authToken);
      }
    } catch (error) {
      this.logger.warn('Twilio not initialized:', error);
    }
  }

  private initializeEmail() {
    try {
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      if (smtpHost) {
        this.emailTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
          secure: false,
          auth: {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          },
        });
      }
    } catch (error) {
      this.logger.warn('Email not initialized:', error);
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not configured, skipping push notification');
      return;
    }

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data ? this.stringifyData(data) : undefined,
      });
      this.logger.log(`Push notification sent to ${fcmToken.substring(0, 10)}...`);
    } catch (error) {
      this.logger.error('Push notification failed:', error);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not configured, skipping WhatsApp');
      return;
    }

    try {
      const from = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');
      await this.twilioClient.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:${phoneNumber}`,
        body: message,
      });
      this.logger.log(`WhatsApp sent to ${phoneNumber}`);
    } catch (error) {
      this.logger.error('WhatsApp failed:', error);
      throw error;
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not configured, skipping SMS');
      return;
    }

    try {
      await this.twilioClient.messages.create({
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
        body: message,
      });
      this.logger.log(`SMS sent to ${phoneNumber}`);
    } catch (error) {
      this.logger.error('SMS failed:', error);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (!this.emailTransporter) {
      this.logger.warn('Email not configured, skipping email');
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error('Email failed:', error);
      throw error;
    }
  }

  /**
   * Send multi-channel notification
   */
  async sendNotification(
    channels: Array<'push' | 'whatsapp' | 'sms' | 'email'>,
    recipients: {
      fcmToken?: string;
      phoneNumber?: string;
      email?: string;
    },
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    if (channels.includes('push') && recipients.fcmToken) {
      promises.push(this.sendPushNotification(recipients.fcmToken, title, message, data));
    }

    if (channels.includes('whatsapp') && recipients.phoneNumber) {
      promises.push(this.sendWhatsApp(recipients.phoneNumber, `${title}\n\n${message}`));
    }

    if (channels.includes('sms') && recipients.phoneNumber) {
      promises.push(this.sendSMS(recipients.phoneNumber, `${title}: ${message}`));
    }

    if (channels.includes('email') && recipients.email) {
      promises.push(
        this.sendEmail(
          recipients.email,
          title,
          `<h2>${title}</h2><p>${message}</p>`,
        ),
      );
    }

    await Promise.allSettled(promises);
  }

  private stringifyData(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }
}
