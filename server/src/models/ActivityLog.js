import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, required: true }, // e.g., "LOGIN", "VIEW_REPORT", "ASKED_AI"
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
}, { timestamps: true });

// Auto-delete logs older than 90 days to save space
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('ActivityLog', activityLogSchema);
