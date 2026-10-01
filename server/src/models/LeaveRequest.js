import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: {
    type: String,
    enum: ['Medical', 'On Duty', 'Sports', 'Placement', 'Internship', 'Personal', 'Industrial Visit'],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  proofDocument: { type: String }, // Cloudinary URL
  proofPublicId: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  // Workflow tracking
  advisorApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    date: { type: Date },
    remarks: { type: String },
  },
  hodApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    date: { type: Date },
    remarks: { type: String },
  },
  // Requires HOD approval if > 3 days
  requiresHODApproval: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
