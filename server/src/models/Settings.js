import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  institutionName: { type: String, required: true, default: 'Smart Institute of Technology' },
  logoUrl: { type: String },
  attendanceConfig: {
    minThreshold: { type: Number, default: 75 }, // Below this is danger
    warningThreshold: { type: Number, default: 80 }, // Below this triggers warnings
    allowFacultyToEditDays: { type: Number, default: 2 }, // How many days past can faculty edit
    autoLockAttendance: { type: Boolean, default: true },
    lockAfterHours: { type: Number, default: 24 }, // Lock attendance 24 hours after class
  },
  aiConfig: {
    enablePredictions: { type: Boolean, default: true },
    enableChatbot: { type: Boolean, default: true },
    predictionCronTime: { type: String, default: '0 0 * * 0' }, // Weekly on Sunday
  },
  notificationConfig: {
    enableEmails: { type: Boolean, default: true },
    enableInApp: { type: Boolean, default: true },
    notifyParentsOnWarning: { type: Boolean, default: true },
  },
  smsSettings: {
    automaticSmsEnabled: { type: Boolean, default: true },
    minimumAttendanceThreshold: { type: Number, default: 80 },
    duplicateSmsProtection: { type: Boolean, default: true },
    templateTamil: { type: String, default: 'அன்பார்ந்த பெற்றோரே, உங்கள் குழந்தை {{studentName}} அவர்களின் தற்போதைய வருகைப்பதிவு {{attendance}}% ஆக உள்ளது. தேவையான வருகைப்பதிவு {{requiredAttendance}}% ஆகும். உங்கள் குழந்தையை வகுப்புகளுக்கு தொடர்ந்து வர ஊக்குவிக்கவும். - SmartERP' },
    templateEnglish: { type: String, default: 'Dear Parent, your ward {{studentName}}\'s current attendance is {{attendance}}%. The required attendance is {{requiredAttendance}}%. Please encourage your child to attend classes regularly. - SmartERP' }
  },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
