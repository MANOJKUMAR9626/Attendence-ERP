import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "100% Attendance", "Early Bird"
  description: { type: String, required: true },
  icon: { type: String, required: true }, // URL or icon class
  criteria: {
    type: String, 
    enum: ['ATTENDANCE_PERCENTAGE', 'ATTENDANCE_STREAK', 'PUNCTUALITY'],
  },
  thresholdValue: { type: Number, required: true }, // e.g. 100 for 100%, 30 for 30-day streak
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Badge', badgeSchema);
