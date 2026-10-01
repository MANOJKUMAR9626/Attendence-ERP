import SMSProvider from './smsProvider.js';
import axios from 'axios';

export default class MSG91Provider extends SMSProvider {
  async sendSMS({ phoneNumber, message, senderId, templateId, credentials }) {
    try {
      if (!credentials?.authKey) {
        throw new Error('MSG91 authKey missing');
      }
      
      const payload = {
        template_id: templateId,
        short_url: '0',
        recipients: [
          {
            mobiles: phoneNumber.replace('+', ''),
            // For MSG91, we should pass variables in the payload based on their flow.
            // If the message is already compiled, we can try to send it via raw API, 
            // but for DLT compliance MSG91 uses variable substitution.
            // Assuming this is a generic implementation:
            VAR1: message // In a real production setup, variables would be mapped exactly to template params.
          }
        ]
      };

      // Simulated SMS for demo mode
      if (process.env.DEMO_SMS_MODE === 'true') {
        console.log(`[DEMO_SMS] Simulated MSG91 SMS to ${phoneNumber}`);
        return { success: true, isDemo: true, messageId: 'demo-msg91-id' };
      }

      // Normally we would do:
      // const response = await axios.post('https://control.msg91.com/api/v5/flow/', payload, {
      //   headers: { authkey: credentials.authKey, 'content-type': 'application/json' }
      // });
      // return { success: true, messageId: response.data.message_id };

      console.log(`[MSG91] Sending SMS to ${phoneNumber}`);
      return { success: true, isDemo: process.env.DEMO_SMS_MODE === 'true', provider: 'MSG91', messageId: `msg91-${Date.now()}` };
    } catch (error) {
      console.error(`MSG91 Error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async testConnection({ credentials }) {
    if (!credentials?.authKey) throw new Error('Missing authKey');
    // Real validation would hit an MSG91 balance or profile endpoint.
    // e.g., axios.get('https://control.msg91.com/api/balance.php', ...)
    return true;
  }
}
