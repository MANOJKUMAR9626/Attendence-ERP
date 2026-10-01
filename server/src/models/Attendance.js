import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late Entry', 'Half Day', 'Medical Leave', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'],
    required: true,
  },
  remarks: { type: String },
  markedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// One record per student per session
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });
// Fast lookup queries
attendanceSchema.index({ student: 1, subject: 1 });
attendanceSchema.index({ student: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
