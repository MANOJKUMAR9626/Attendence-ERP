import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import Timetable from '../src/models/Timetable.js';

const fillTimetablesAllDays = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    // Find all Monday timetables
    const mondayTimetables = await Timetable.find({ dayOfWeek: 'Monday' });
    console.log(`Found ${mondayTimetables.length} Monday timetables. Duplicating to other days...`);

    const targetDays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let count = 0;

    for (const tt of mondayTimetables) {
      for (const day of targetDays) {
        // Upsert timetable for this day
        await Timetable.findOneAndUpdate(
          { section: tt.section, dayOfWeek: day },
          {
            section: tt.section,
            semester: tt.semester,
            academicYear: tt.academicYear,
            department: tt.department,
            dayOfWeek: day,
            periods: tt.periods,
            isActive: true
          },
          { upsert: true, new: true }
        );
        count++;
      }
    }

    console.log(`Successfully generated ${count} timetables for Tuesday through Saturday!`);
    process.exit(0);
  } catch (err) {
    console.error('Error copying timetables:', err);
    process.exit(1);
  }
};

fillTimetablesAllDays();
