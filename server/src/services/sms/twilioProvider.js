import SMSProvider from './smsProvider.js';
import twilio from 'twilio';

export default class TwilioProvider extends SMSProvider {
  async sendSMS({ phoneNumber, message, senderId, templateId, credentials }) {
    try {
      const accountSid = credentials?.accountSid || process.env.TWILIO_ACCOUNT_SID;
      const authToken = credentials?.authToken || process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = senderId || process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromPhone) {
        throw new Error('Twilio credentials missing');
      }

      if (process.env.DEMO_SMS_MODE === 'true') {
        console.log(`[DEMO_SMS] Simulated Twilio SMS to ${phoneNumber}`);
        return { success: true, isDemo: true, messageId: 'demo-twilio-id' };
      }

      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to: phoneNumber
      });

      return { success: true, isDemo: false, messageId: result.sid };
    } catch (error) {
      console.error(`Twilio Error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async testConnection({ credentials }) {
    const accountSid = credentials?.accountSid;
    const authToken = credentials?.authToken;
    if (!accountSid || !authToken) throw new Error('Missing Twilio credentials');
    
    try {
      const client = twilio(accountSid, authToken);
      await client.api.accounts(accountSid).fetch();
      return true;
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }
}
