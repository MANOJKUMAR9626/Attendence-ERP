import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  date: { type: Date, required: true },
  periodNumber: { type: Number, required: true },
  topicCovered: { type: String },
  isLocked: { type: Boolean, default: false }, // Cannot edit if locked
  lockedAt: { type: Date },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Scheduled', 'Conducted', 'Cancelled'], default: 'Scheduled' },
  sessionType: { type: String, enum: ['Regular', 'Extra Class', 'Lab'], default: 'Regular' },
}, { timestamps: true });

// One session per faculty/subject/section/date/period
attendanceSessionSchema.index({ faculty: 1, subject: 1, section: 1, date: 1, periodNumber: 1 }, { unique: true });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);
