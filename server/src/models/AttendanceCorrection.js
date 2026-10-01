import mongoose from 'mongoose';

const attendanceCorrectionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  originalStatus: { type: String, required: true },
  requestedStatus: { type: String, required: true },
  reason: { type: String, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student or Faculty
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }, // Usually HOD or Admin
  approvalDate: { type: Date },
  remarks: { type: String },
}, { timestamps: true });

export default mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);
