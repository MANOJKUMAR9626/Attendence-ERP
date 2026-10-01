import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Semester 1"
  number: { type: Number, required: true }, // 1-8
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: false },
  isCurrent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Semester', semesterSchema);
