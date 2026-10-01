import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import Timetable from '../src/models/Timetable.js';
import FacultyAllocation from '../src/models/FacultyAllocation.js';
import Faculty from '../src/models/Faculty.js';
import Subject from '../src/models/Subject.js';

const fixAllocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const timetables = await Timetable.find().populate('periods.faculty').populate('periods.subject');
    console.log(`Found ${timetables.length} timetables.`);

    let added = 0;

    for (let tt of timetables) {
      for (let p of tt.periods) {
        if (!p.faculty || !p.subject) continue;
        
        await FacultyAllocation.findOneAndUpdate(
          {
            faculty: p.faculty._id,
            subject: p.subject._id,
            section: tt.section
          },
          {
            faculty: p.faculty._id,
            subject: p.subject._id,
            section: tt.section,
            department: tt.department,
            isActive: true
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        added++;
      }
    }

    console.log(`Successfully generated and synced ${added} faculty allocations!`);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing allocations:', err);
    process.exit(1);
  }
};

fixAllocations();
