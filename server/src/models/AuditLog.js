import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who performed the action
  action: { type: String, required: true }, // e.g., "UPDATE_ATTENDANCE_POLICY", "LOCK_ATTENDANCE"
  entityType: { type: String, required: true }, // e.g., "AttendanceSession", "Settings"
  entityId: { type: mongoose.Schema.Types.ObjectId }, // ID of the affected document
  oldValue: { type: mongoose.Schema.Types.Mixed }, // Previous state
  newValue: { type: mongoose.Schema.Types.Mixed }, // New state
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
