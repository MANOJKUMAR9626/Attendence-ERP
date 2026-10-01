import mongoose from 'mongoose';

const deptSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  description: String,
  establishedYear: Number,
  totalStudents: { type: Number, default: 0 },
  totalFaculty: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Department', deptSchema);
