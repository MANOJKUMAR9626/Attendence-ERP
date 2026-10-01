import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g. "2024-2025"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('AcademicYear', academicYearSchema);
