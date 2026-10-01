import smsService from '../services/sms/smsService.js';

const sendSMS = async (options) => {
  // Map legacy options `{ phone, message }` to `smsService`
  try {
    const result = await smsService.sendSMS({
      phoneNumber: options.phone,
      message: options.message
    });
    
    // Maintain legacy return format for backwards compatibility
    if (result && result.success) {
      if (result.isDemo) {
        return { isDemo: true, to: options.phone, message: options.message };
      }
      return { isDemo: false, to: options.phone, message: options.message, sid: result.messageId };
    } else {
      return { success: false, error: result?.error || 'Unknown error' };
    }
  } catch (error) {
    console.error(`❌ Failed to send SMS via smsService:`, error.message);
    return { success: false, error: error.message };
  }
};

export default sendSMS;
