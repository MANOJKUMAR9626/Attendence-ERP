import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, uppercase: true }, // A, B, C
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  maxStrength: { type: Number, default: 60 },
  currentStrength: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

sectionSchema.index({ department: 1, course: 1, semester: 1, name: 1 });

export default mongoose.model('Section', sectionSchema);
