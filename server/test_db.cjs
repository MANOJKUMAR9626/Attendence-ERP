const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const AttendanceSession = mongoose.model('AttendanceSession', new mongoose.Schema({}, {strict: false}), 'attendancesessions');
  const targetDate = new Date('2026-08-24');
  const todayStart = new Date(targetDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(targetDate);
  todayEnd.setHours(23, 59, 59, 999);
  
  const markedSessions = await AttendanceSession.find({
    status: 'Conducted',
    date: { $gte: todayStart, $lte: todayEnd }
  });
  console.log('For 2026-08-24:', markedSessions.length);
  
  const targetDate23 = new Date('2026-08-23');
  const start23 = new Date(targetDate23); start23.setHours(0,0,0,0);
  const end23 = new Date(targetDate23); end23.setHours(23,59,59,999);
  const marked23 = await AttendanceSession.find({
    status: 'Conducted',
    date: { $gte: start23, $lte: end23 }
  });
  console.log('For 2026-08-23:', marked23.length);

  process.exit(0);
});
