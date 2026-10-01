import SMSProvider from './smsProvider.js';

const BASE_URL =
  process.env.TEXTBEE_BASE_URL || 'https://api.textbee.dev/api/v1';

class TextBeeProvider extends SMSProvider {
  async sendSMS({
    phoneNumber,
    message,
    deviceId,
    simSubscriptionId,
    credentials
  }) {
    try {
      const apiKey = credentials?.apiKey || process.env.TEXTBEE_API_KEY;
      
      const finalDeviceId = deviceId || credentials?.deviceId;
      const finalSimSubscriptionId = simSubscriptionId || credentials?.simSubscriptionId;

      if (!apiKey) {
        return {
          success: false,
          error: 'TEXTBEE_API_KEY is missing'
        };
      }

      if (!phoneNumber) {
        return {
          success: false,
          error: 'Phone number is required'
        };
      }

      if (!message) {
        return {
          success: false,
          error: 'Message is required'
        };
      }

      let formattedPhone = String(phoneNumber).trim();

      // Indian 10-digit number
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
      }
      // 91XXXXXXXXXX
      else if (
        /^\d{12}$/.test(formattedPhone) &&
        formattedPhone.startsWith('91')
      ) {
        formattedPhone = `+${formattedPhone}`;
      }
      // Any number without +
      else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      const body = {
        recipients: [formattedPhone],
        message
      };

      if (finalDeviceId) {
        body.deviceId = finalDeviceId;
      }

      if (finalSimSubscriptionId) {
        body.simSubscriptionId = Number(finalSimSubscriptionId);
      }

      const response = await fetch(
        `${BASE_URL}/gateway/send-sms`,
        {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        console.error(
          `❌ TextBee SMS failed (${response.status}):`,
          result?.message || 'Unknown error'
        );

        return {
          success: false,
          provider: 'TextBee',
          statusCode: response.status,
          error:
            result?.message ||
            'TextBee SMS request failed'
        };
      }

      console.log(
        `✅ TextBee SMS accepted for ${formattedPhone}`
      );

      return {
        success: true,
        provider: 'TextBee',
        to: formattedPhone,
        message,
        smsBatchId:
          result?.data?.smsBatchId || null,
        rawResponse: result
      };

    } catch (error) {
      console.error(
        '❌ TextBee provider error:',
        error.message
      );

      return {
        success: false,
        provider: 'TextBee',
        error: error.message
      };
    }
  }

  async testConnection({ credentials = {} } = {}) {
    try {
      const apiKey = (credentials.apiKey || process.env.TEXTBEE_API_KEY || '').trim();

      console.log(
        '🔑 TextBee API key loaded:',
        apiKey
          ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)} | length=${apiKey.length}`
          : 'MISSING'
      );

      if (!apiKey) {
        return {
          success: false,
          provider: 'TextBee',
          error: 'TextBee API key is missing'
        };
      }

      const response = await fetch(
        `${BASE_URL}/gateway/devices`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        }
      );

      const responseText = await response.text();

      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = {
          rawResponse: responseText
        };
      }

      console.log(
        `🔎 TextBee connection response: ${response.status}`,
        result
      );

      if (!response.ok) {
        return {
          success: false,
          provider: 'TextBee',
          statusCode: response.status,
          error:
            result?.message ||
            result?.error ||
            `TextBee API returned ${response.status}`,
          details: result
        };
      }

      const devices = Array.isArray(result?.data)
        ? result.data
        : [];

      return {
        success: true,
        provider: 'TextBee',
        message: 'TextBee API connection successful',
        deviceCount: devices.length,
        deviceAvailable: devices.some(
          device => device.enabled === true
        )
      };

    } catch (error) {
      console.error(
        '❌ TextBee connection error:',
        error.message
      );

      return {
        success: false,
        provider: 'TextBee',
        error: error.message
      };
    }
  }
}

export default TextBeeProvider;
