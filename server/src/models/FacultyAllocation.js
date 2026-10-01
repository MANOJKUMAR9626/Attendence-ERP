import mongoose from 'mongoose';

const facultyAllocationSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure a faculty member is not allocated to the same subject and section twice
facultyAllocationSchema.index({ faculty: 1, subject: 1, section: 1 }, { unique: true });

export default mongoose.model('FacultyAllocation', facultyAllocationSchema);
