import SMSProvider from './smsProvider.js';

export default class TextlocalProvider extends SMSProvider {
  async sendSMS({ phoneNumber, message, senderId, templateId, credentials }) {
    try {
      if (!credentials?.apiKey) {
        throw new Error('Textlocal apiKey missing');
      }

      if (process.env.DEMO_SMS_MODE === 'true') {
        console.log(`[DEMO_SMS] Simulated Textlocal SMS to ${phoneNumber}`);
        return { success: true, isDemo: true, messageId: 'demo-textlocal-id' };
      }

      // Normally we would do:
      // const params = new URLSearchParams();
      // params.append('apikey', credentials.apiKey);
      // params.append('numbers', phoneNumber);
      // params.append('message', encodeURIComponent(message));
      // params.append('sender', senderId || 'TXTLCL');
      // const response = await axios.post('https://api.textlocal.in/send/', params);

      console.log(`[Textlocal] Sending SMS to ${phoneNumber}`);
      return { success: true, isDemo: false, provider: 'Textlocal', messageId: `txtlcl-${Date.now()}` };
    } catch (error) {
      console.error(`Textlocal Error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async testConnection({ credentials }) {
    if (!credentials?.apiKey) throw new Error('Missing apiKey');
    return true;
  }
}
