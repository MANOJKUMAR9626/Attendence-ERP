import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Targeted user
  type: {
    type: String,
    enum: ['Attendance Alert', 'Leave Update', 'System', 'AI Insight', 'Meeting', 'Report'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  actionUrl: { type: String }, // Optional link to open on click
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  deliveryMethods: [{ type: String, enum: ['In-App', 'Email', 'SMS', 'WhatsApp', 'Push'] }],
  deliveryStatus: {
    email: { type: String, enum: ['Pending', 'Sent', 'Failed', 'Not Configured'], default: 'Not Configured' },
    sms: { type: String, enum: ['Pending', 'Sent', 'Failed', 'Not Configured'], default: 'Not Configured' },
  },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
