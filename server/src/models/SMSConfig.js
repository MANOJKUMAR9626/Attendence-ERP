import mongoose from 'mongoose';

const smsConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ['Twilio', 'MSG91', 'Textlocal', 'TextBee', 'Other'],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  credentials: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Should contain e.g., apiKey, accountSid, authToken depending on provider
  },
  senderId: {
    type: String,
  },
  templateId: {
    type: String, // DLT Template ID
  },
  countryCode: {
    type: String,
    default: 'IN',
  },
}, { timestamps: true });

// Ensure only one provider is active at a time
smsConfigSchema.pre('save', async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

export default mongoose.model('SMSConfig', smsConfigSchema);
