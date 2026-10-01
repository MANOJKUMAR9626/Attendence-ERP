import crypto from 'crypto';
import SMSConfig from '../../models/SMSConfig.js';
import Settings from '../../models/Settings.js';
import MSG91Provider from './msg91Provider.js';
import TwilioProvider from './twilioProvider.js';
import TextlocalProvider from './textlocalProvider.js';
import TextBeeProvider from './textbeeProvider.js';

// Simple encryption/decryption using AES-256-CBC
const ENCRYPTION_KEY = process.env.SMS_ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 32 chars
const IV_LENGTH = 16;

export function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Encryption error:', err);
    return text; // Fallback for dev if key is wrong length
  }
}

export function decrypt(text) {
  if (!text) return text;
  try {
    if (!text.includes(':')) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption error:', err);
    return text;
  }
}

class SMSService {
  constructor() {
    this.providers = {
      'MSG91': new MSG91Provider(),
      'Twilio': new TwilioProvider(),
      'Textlocal': new TextlocalProvider(),
      'TextBee': new TextBeeProvider(),
    };
  }

  getProviderInstance(providerName) {
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Unsupported SMS provider: ${providerName}`);
    }
    return provider;
  }

  decryptCredentials(encryptedCreds) {
    const creds = { ...encryptedCreds };
    for (const key in creds) {
      creds[key] = decrypt(creds[key]);
    }
    return creds;
  }

  formatPhoneNumber(phone, countryCode = 'IN') {
    let formatted = phone ? String(phone).trim() : 'Unknown';
    if (formatted !== 'Unknown') {
      if (formatted.length === 10 && /^\d+$/.test(formatted)) {
        formatted = countryCode === 'IN' ? '+91' + formatted : '+' + formatted;
      } else if (!formatted.startsWith('+')) {
        formatted = '+' + formatted;
      }
    }
    return formatted;
  }

  async getActiveConfig() {
    const config = await SMSConfig.findOne({ isActive: true });
    if (!config) {
      // Return a dummy fallback Twilio config if nothing is in DB yet
      return {
        provider: 'Twilio',
        credentials: {},
        countryCode: 'IN'
      };
    }
    return config;
  }

  async sendSMS({ phoneNumber, message }) {
    const config = await this.getActiveConfig();
    const providerInstance = this.getProviderInstance(config.provider);

    const formattedPhone = this.formatPhoneNumber(phoneNumber, config.countryCode);
    if (formattedPhone === 'Unknown') return { success: false, error: 'Invalid phone number' };

    const decryptedCredentials = this.decryptCredentials(config.credentials || {});

    return await providerInstance.sendSMS({
      phoneNumber: formattedPhone,
      message,
      senderId: config.senderId,
      templateId: config.templateId,
      credentials: decryptedCredentials
    });
  }

  async testConnection(providerName, credentials) {
    const providerInstance = this.getProviderInstance(providerName);
    return await providerInstance.testConnection({ credentials });
  }

  async sendAttendanceAlert(studentObj, parentObj, percentage, threshold) {
    try {
      const settings = await Settings.findOne();
      const smsSettings = settings?.smsSettings || {};

      if (smsSettings.automaticSmsEnabled === false) {
        console.log('SMS is disabled in settings. Skipping.');
        return null;
      }

      // Prevent duplicate SMS to the same person on the same day for the same student
      const todayStr = new Date().toISOString().slice(0, 10);
      const cacheKey = `${studentObj._id}-${parentObj.user?.phone}-${todayStr}`;
      
      if (this.sentSMSCache && this.sentSMSCache.has(cacheKey)) {
        console.log(`[SMS DUPLICATE PROTECTION] SMS already sent to ${parentObj.user?.phone} for student ${studentObj.user?.name} today. Skipping.`);
        return null;
      }

      const studentName = studentObj.user?.name || '';
      const attendance = Math.round(percentage);
      const requiredAttendance = threshold;

      const message = `அன்பார்ந்த பெற்றோரே, உங்கள் குழந்தை ${studentName} அவர்களின் தற்போதைய வருகைப்பதிவு ${attendance}% ஆக உள்ளது. தேவையான வருகைப்பதிவு ${requiredAttendance}% ஆகும். உங்கள் குழந்தையை வகுப்புகளுக்கு தொடர்ந்து வர ஊக்குவிக்கவும்.

English:

Dear Parent, your ward ${studentName}'s current attendance is ${attendance}%. The required attendance is ${requiredAttendance}%. Please encourage your child to attend classes regularly.`;

      const result = await this.sendSMS({
        phoneNumber: parentObj.user?.phone,
        message
      });
      
      if (result && result.success) {
        if (!this.sentSMSCache) this.sentSMSCache = new Set();
        this.sentSMSCache.add(cacheKey);
        
        // Clear cache periodically to prevent memory leak (e.g. at midnight, but a simple size check works too)
        if (this.sentSMSCache.size > 10000) {
           this.sentSMSCache.clear();
        }
      }
      
      return result;
    } catch (err) {
      console.error('Failed to send attendance alert SMS:', err);
      return null;
    }
  }
}

export default new SMSService();
