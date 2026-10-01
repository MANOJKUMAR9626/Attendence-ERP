import mongoose from 'mongoose';
import Attendance from './src/models/Attendance.js';
import Student from './src/models/Student.js';

const run = async () => {
    await mongoose.connect('mongodb://localhost:27017/attendance_erp');
    const student = await Student.findOne();
    if (!student) { console.log("No student"); process.exit(); }
    
    const semesterStart = new Date();
    semesterStart.setMonth(0, 1);
    semesterStart.setHours(0, 0, 0, 0);
    const semesterEnd = new Date(semesterStart.getFullYear(), 11, 31, 23, 59, 59);

    const semesterRecords = await Attendance.find({ 
      student: student._id,
      date: { $gte: semesterStart, $lte: semesterEnd }
    });

    let semesterTotalClasses = semesterRecords.length;
    let semesterPresentCount = semesterRecords.filter(r => ['Present', 'Late Entry', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(r.status)).length;
    
    const overall = semesterTotalClasses > 0 
      ? Math.round((semesterPresentCount / semesterTotalClasses) * 100) 
      : 0;

    const dayMap = {};
    semesterRecords.forEach(r => {
        const d = new Date(r.date);
        d.setHours(0,0,0,0);
        const dayKey = d.getTime();
        
        if (!dayMap[dayKey]) {
            dayMap[dayKey] = { 
                label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), 
                present: 0, 
                total: 0 
            };
        }
        dayMap[dayKey].total++;
        if (['Present', 'On Duty', 'Late Entry'].includes(r.status)) dayMap[dayKey].present++;
    });
    
    const sortedDays = Object.keys(dayMap).sort((a,b) => a-b);
    const last7Days = sortedDays.slice(-7);
    
    let trendData = last7Days.map(k => ({
        timestamp: parseInt(k),
        month: dayMap[k].label, 
        value: Math.round((dayMap[k].present / dayMap[k].total) * 100)
    }));

    if (trendData.length === 0) {
       trendData = Array.from({length: 5}).map((_, i) => {
         const d = new Date();
         d.setDate(d.getDate() - (4 - i));
         return {
           month: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
           value: overall > 0 ? Math.max(0, overall - (4-i)*5) : 0
         };
       });
    } else if (trendData.length > 0 && trendData.length < 3) {
       while (trendData.length < 3) {
           const firstItem = trendData[0];
           const prevTs = firstItem.timestamp ? firstItem.timestamp - 24 * 60 * 60 * 1000 : Date.now() - 24 * 60 * 60 * 1000;
           const prevDate = new Date(prevTs);
           trendData.unshift({ 
               timestamp: prevTs,
               month: prevDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), 
               value: overall 
           });
       }
    }
    console.log(JSON.stringify(trendData, null, 2));
    process.exit();
};
run();
