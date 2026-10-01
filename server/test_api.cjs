const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const Timetable = mongoose.model('Timetable', new mongoose.Schema({}, {strict: false}), 'timetables');
  const Faculty = mongoose.model('Faculty', new mongoose.Schema({}, {strict: false}), 'faculties');
  const AttendanceSession = mongoose.model('AttendanceSession', new mongoose.Schema({}, {strict: false}), 'attendancesessions');

  const faculty = await Faculty.findOne({ 'user': new mongoose.Types.ObjectId('6a8b0629244a069d06e6ce40') }); // Replace with actual user ID if needed, but let's just pick any faculty
  if (!faculty) { console.log('no faculty'); process.exit(1); }

  const targetDate = new Date('2026-08-24');
  let today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDate.getDay()];
  if (today === 'Saturday' || today === 'Sunday') today = 'Monday';

  let facultyPeriods = [];
  const timetables = await Timetable.find({ 'periods.faculty': faculty._id, dayOfWeek: today }).populate('section semester department periods.subject');
  timetables.forEach(tt => {
    const myPeriods = tt.periods.filter(p => p.faculty.toString() === faculty._id.toString());
    myPeriods.forEach(p => {
      facultyPeriods.push({ periodNumber: p.periodNumber, isAllocation: false });
    });
  });

  const todayStart = new Date(targetDate); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(targetDate); todayEnd.setHours(23, 59, 59, 999);

  const markedSessions = await AttendanceSession.find({
    faculty: faculty._id,
    status: 'Conducted',
    date: { $gte: todayStart, $lte: todayEnd }
  });

  const enrichedPeriods = facultyPeriods.map(p => {
    const isCompleted = markedSessions.some(s => s.periodNumber === p.periodNumber);
    return { ...p, isCompleted };
  });

  console.log('enrichedPeriods:', enrichedPeriods);
  process.exit(0);
});
