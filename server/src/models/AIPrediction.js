import mongoose from 'mongoose';

const aiPredictionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  predictionDate: { type: Date, default: Date.now },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  confidenceScore: { type: Number, required: true }, // e.g. 0.85
  // AI output analysis
  explanation: [{ type: String }],
  forecastToSemesterEnd: { type: Number }, // Predicted final attendance %
  classesToReachThreshold: { type: Number }, // Classes needed to hit 75%
  recoveryDate: { type: Date }, // Estimated date to reach threshold
  recommendations: [{ type: String }],
  // Features used for prediction at that point in time
  featuresSnapshot: {
    attendancePercentage: Number,
    consecutiveAbsences: Number,
    leaveCount: Number,
    semesterProgress: Number,
    previousSemesterAttendance: Number,
  },
}, { timestamps: true });

aiPredictionSchema.index({ student: 1, predictionDate: -1 });

export default mongoose.model('AIPrediction', aiPredictionSchema);
