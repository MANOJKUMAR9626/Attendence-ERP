import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  periods: [{
    periodNumber: { type: Number, required: true }, // 1, 2, 3...
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "10:00"
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    room: { type: String },
    isLab: { type: Boolean, default: false },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// One timetable per section per day per semester
timetableSchema.index({ section: 1, semester: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);
