import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  type: { type: String, enum: ['Theory', 'Lab', 'Tutorial', 'Project', 'Elective'], default: 'Theory' },
  credits: { type: Number, default: 3 },
  hoursPerWeek: { type: Number, default: 3 },
  isElective: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

subjectSchema.index({ code: 1, course: 1, semester: 1 });

export default mongoose.model('Subject', subjectSchema);
