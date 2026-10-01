import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  registerNumber: { type: String, unique: true, trim: true },
  admissionNumber: { type: String, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  currentSemester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  batch: { type: String, trim: true }, // e.g. "2022-2026"
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: String,
  address: {
    street: String, city: String, state: String,
    pincode: String, country: { type: String, default: 'India' },
  },
  guardianName: String,
  guardianPhone: String,
  guardianRelation: String,
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
  classAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  // Computed attendance summary (cached)
  attendanceSummary: {
    overallPercentage: { type: Number, default: 0 },
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 },
    lastUpdated: Date,
  },
  aiRiskLevel: { type: String, enum: ['NA', 'Low', 'Medium', 'High', 'Critical'], default: 'NA' },
  isEligibleForExam: { type: Boolean, default: true },
  attendanceThreshold: { type: Number, default: 75 },
  badges: [{ name: String, icon: String, earnedAt: Date }],
  attendanceStreak: { type: Number, default: 0 },
  qrCode: String,
  digitalIdCard: String,
  isActive: { type: Boolean, default: true },
  notes: String,
}, { timestamps: true });


studentSchema.index({ department: 1, currentSemester: 1, section: 1 });

export default mongoose.model('Student', studentSchema);
