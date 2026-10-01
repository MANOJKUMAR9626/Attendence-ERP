
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const Attendance = require('./src/models/Attendance.js').default;
  const Student = require('./src/models/Student.js').default;
  
  await Attendance.updateMany({ status: 'Permission' }, { $set: { status: 'Present' } });
  console.log('Fixed permissions to present');
  
  const allStudents = await Student.find();
  for (const s of allStudents) {
    const allRecords = await Attendance.find({ student: s._id });
    if(allRecords.length === 0) continue;
    const total = allRecords.length;
    const present = allRecords.filter(x => ['Present', 'Late Entry', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(x.status)).length;
    const percentage = total === 0 ? 0 : ((present / total) * 100);
    await Student.findByIdAndUpdate(s._id, {
      'attendanceSummary.overallPercentage': percentage,
      'attendanceSummary.totalPresent': present,
      'attendanceSummary.totalAbsent': total - present,
      'attendanceSummary.totalClasses': total,
      'attendanceSummary.lastUpdated': new Date()
    });
  }
  console.log('Recalculated student summaries');
  process.exit(0);
});

