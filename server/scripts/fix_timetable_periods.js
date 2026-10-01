import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import Timetable from '../src/models/Timetable.js';

const newTimes = [
  { startTime: '09:00', endTime: '10:30' },
  { startTime: '11:00', endTime: '12:30' },
  { startTime: '13:30', endTime: '15:00' },
  { startTime: '15:15', endTime: '16:25' }
];

const fixTimetablePeriods = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const timetables = await Timetable.find();
    console.log(`Found ${timetables.length} timetables to update.`);

    let updatedCount = 0;
    for (let tt of timetables) {
      let needsUpdate = false;
      
      tt.periods.forEach((period, index) => {
        if (index < 4) {
          period.startTime = newTimes[index].startTime;
          period.endTime = newTimes[index].endTime;
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        await tt.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated period times for ${updatedCount} timetables!`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating timetables:', err);
    process.exit(1);
  }
};

fixTimetablePeriods();
