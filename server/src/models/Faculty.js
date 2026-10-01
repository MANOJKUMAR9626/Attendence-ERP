import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  designation: { type: String },
  qualification: String,
  specialization: String,
  experience: { type: Number, default: 0 }, // years
  dateOfJoining: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: Date,
  address: {
    street: String, city: String, state: String, pincode: String,
    country: { type: String, default: 'India' },
  },
  // Roles
  isHOD: { type: Boolean, default: false },
  isClassAdvisor: { type: Boolean, default: false },
  advisorSection: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  advisorSemester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  advisorAcademicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  // Allocations (populated via FacultyAllocation)
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  isActive: { type: Boolean, default: true },
  notes: String,
}, { timestamps: true });


facultySchema.index({ department: 1 });

export default mongoose.model('Faculty', facultySchema);
