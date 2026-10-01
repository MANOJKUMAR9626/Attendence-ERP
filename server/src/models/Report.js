import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['Daily Attendance', 'Weekly Attendance', 'Monthly Attendance', 'Semester Defaulters', 'AI Prediction', 'Department Analytics'],
    required: true,
  },
  format: { type: String, enum: ['PDF', 'Excel', 'CSV'], required: true },
  parameters: { type: mongoose.Schema.Types.Mixed }, // e.g. { semesterId, departmentId, dateRange }
  fileUrl: { type: String }, // Link to stored report (Cloudinary or local temp)
  status: { type: String, enum: ['Processing', 'Completed', 'Failed'], default: 'Processing' },
  expiresAt: { type: Date }, // Optional: auto-delete old reports
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
