import SMSConfig from '../models/SMSConfig.js';
import Settings from '../models/Settings.js';
import AuditLog from '../models/AuditLog.js';
import smsService, { encrypt } from '../services/sms/smsService.js';

// GET /api/v1/admin/sms/providers
export const getProviders = async (req, res, next) => {
  try {
    const providers = [
      {
        id: 'MSG91',
        name: 'MSG91',
        fields: [{ name: 'authKey', label: 'Auth Key', type: 'password' }],
        requiresTemplateId: true
      },
      {
        id: 'Twilio',
        name: 'Twilio',
        fields: [
          { name: 'accountSid', label: 'Account SID', type: 'text' },
          { name: 'authToken', label: 'Auth Token', type: 'password' }
        ],
        requiresTemplateId: false
      },
      {
        id: 'Textlocal',
        name: 'Textlocal',
        fields: [{ name: 'apiKey', label: 'API Key', type: 'password' }],
        requiresTemplateId: false
      },
      {
        id: 'TextBee',
        name: 'TextBee',
        fields: [
          { name: 'apiKey', label: 'API Key', type: 'password' },
          { name: 'deviceId', label: 'Device ID (Optional)', type: 'text' },
          { name: 'simSubscriptionId', label: 'SIM Subscription ID (Optional)', type: 'text' }
        ],
        requiresTemplateId: false
      }
    ];
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/sms/config
export const getSMSConfig = async (req, res, next) => {
  try {
    const config = await SMSConfig.findOne({ isActive: true });
    
    // Mask credentials before sending to client
    let maskedCredentials = {};
    if (config && config.credentials) {
      const decrypted = smsService.decryptCredentials(config.credentials);
      for (const [key, value] of Object.entries(decrypted)) {
        if (value) {
          maskedCredentials[key] = value.substring(0, 4) + '••••••••••••••••';
        }
      }
    }

    const settings = await Settings.findOne();
    const smsSettings = settings?.smsSettings || {};

    res.status(200).json({
      success: true,
      data: {
        provider: config?.provider || 'Twilio',
        senderId: config?.senderId || '',
        templateId: config?.templateId || '',
        countryCode: config?.countryCode || 'IN',
        credentials: maskedCredentials,
        settings: smsSettings
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/admin/sms/config
export const updateSMSConfig = async (req, res, next) => {
  try {
    const { provider, credentials, senderId, templateId, countryCode, settings } = req.body;
    
    // Handle credentials encryption
    let newCredentials = {};
    const existingConfig = await SMSConfig.findOne({ provider });
    const decryptedExisting = existingConfig ? smsService.decryptCredentials(existingConfig.credentials) : {};
    
    if (credentials) {
      for (const [key, value] of Object.entries(credentials)) {
        if (value && !value.includes('••••')) {
          newCredentials[key] = encrypt(value);
        } else if (existingConfig && existingConfig.credentials[key]) {
          // Keep existing encrypted value if masked value was sent
          newCredentials[key] = existingConfig.credentials[key];
        }
      }
    }

    const updatedConfig = await SMSConfig.findOneAndUpdate(
      { provider },
      {
        provider,
        isActive: true,
        credentials: newCredentials,
        senderId,
        templateId,
        countryCode
      },
      { new: true, upsert: true }
    );

    // Make sure other providers are deactivated
    await SMSConfig.updateMany(
      { _id: { $ne: updatedConfig._id } },
      { $set: { isActive: false } }
    );

    // Update settings if provided
    if (settings) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { smsSettings: settings } },
        { new: true, upsert: true }
      );
    }

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_SMS_CONFIG',
      entityType: 'SMSConfig',
      entityId: updatedConfig._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: 'SMS Configuration saved successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/sms/test-connection
export const testConnection = async (req, res, next) => {
  try {
    const { provider, credentials } = req.body;
    
    // Resolve credentials
    const existingConfig = await SMSConfig.findOne({ provider });
    let testCredentials = {};
    
    if (credentials) {
      for (const [key, value] of Object.entries(credentials)) {
        if (value && !value.includes('••••')) {
          testCredentials[key] = value; // newly entered, unencrypted
        } else if (existingConfig) {
          const decryptedExisting = smsService.decryptCredentials(existingConfig.credentials);
          testCredentials[key] = decryptedExisting[key];
        }
      }
    }

    const isConnected = await smsService.testConnection(provider, testCredentials);
    if (isConnected) {
      res.status(200).json({ success: true, message: 'Connection successful' });
    } else {
      res.status(400).json({ success: false, message: 'Connection failed' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Connection failed' });
  }
};

// POST /api/v1/admin/sms/test-message
export const sendTestMessage = async (req, res, next) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ success: false, message: 'Phone number and message required' });
    }

    const result = await smsService.sendSMS({ phoneNumber, message });
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'Test SMS request submitted successfully.', data: result });
    } else {
      res.status(400).json({ success: false, message: `Test SMS failed. Reason: ${result.error}` });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: `Test SMS failed. Reason: ${error.message}` });
  }
};

// GET /api/v1/admin/sms/status
export const getSMSStatus = async (req, res, next) => {
  try {
    const config = await SMSConfig.findOne({ isActive: true });
    const settings = await Settings.findOne();
    
    res.status(200).json({
      success: true,
      data: {
        provider: config?.provider || 'None',
        configured: !!config,
        automaticSmsEnabled: settings?.smsSettings?.automaticSmsEnabled || false,
        lastSmsSent: new Date() // Placeholder, you could query Notification DB for this
      }
    });
  } catch (error) {
    next(error);
  }
};
