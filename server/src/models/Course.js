import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  type: { type: String, enum: ['UG', 'PG', 'Diploma', 'PhD'], default: 'UG' },
  duration: { type: Number, default: 4 }, // years
  totalSemesters: { type: Number, default: 8 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
