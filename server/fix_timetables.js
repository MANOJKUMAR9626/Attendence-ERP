import mongoose from 'mongoose';
import Section from './src/models/Section.js';
import Faculty from './src/models/Faculty.js';
import Subject from './src/models/Subject.js';
import Timetable from './src/models/Timetable.js';
import FacultyAllocation from './src/models/FacultyAllocation.js';
import Department from './src/models/Department.js';
import Semester from './src/models/Semester.js';
import AcademicYear from './src/models/AcademicYear.js';

const TIME_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:15', end: '11:15' },
  { start: '11:30', end: '12:30' },
  { start: '13:30', end: '15:10' },
  { start: '15:25', end: '16:25' }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/attendance_erp');
  console.log('Connected to DB');

  await Timetable.deleteMany({});
  await FacultyAllocation.deleteMany({});
  console.log('Cleared existing timetables and allocations');

  const sections = await Section.find();
  const faculties = await Faculty.find();
  const semester = await Semester.findOne();
  const year = await AcademicYear.findOne();
  
  if (!semester || !year) {
    console.log('Need semester and year');
    process.exit(1);
  }

  // Ensure each faculty has at least one subject
  const subjects = await Subject.find();
  const facultySubjects = new Map();
  faculties.forEach((f, i) => {
    facultySubjects.set(f._id.toString(), subjects[i % subjects.length]._id);
  });

  const allocationsToInsert = [];
  
  for (const day of DAYS) {
    // Keep track of which faculty is busy at which period
    // periods range from 0 to 4
    const facultyBusy = Array(faculties.length).fill().map(() => Array(5).fill(false));
    
    for (const section of sections) {
      const periods = [];
      for (let p = 0; p < 5; p++) {
        // Find an available faculty for this period
        let chosenFacIdx = -1;
        // Start searching from a random offset to distribute load
        const startOffset = Math.floor(Math.random() * faculties.length);
        for (let i = 0; i < faculties.length; i++) {
          const idx = (startOffset + i) % faculties.length;
          if (!facultyBusy[idx][p]) {
            chosenFacIdx = idx;
            break;
          }
        }
        
        if (chosenFacIdx === -1) {
          // Fallback, just pick a random one if somehow all are busy (impossible with 100 fac, 80 sec)
          chosenFacIdx = Math.floor(Math.random() * faculties.length);
        }
        
        facultyBusy[chosenFacIdx][p] = true;
        const fac = faculties[chosenFacIdx];
        const subId = facultySubjects.get(fac._id.toString());
        
        // Also save allocation to make it officially taught by this faculty
        allocationsToInsert.push({
          faculty: fac._id,
          subject: subId,
          section: section._id,
          department: section.department,
          academicYear: year._id,
          semester: semester._id,
          isActive: true
        });

        periods.push({
          periodNumber: p + 1,
          startTime: TIME_SLOTS[p].start,
          endTime: TIME_SLOTS[p].end,
          subject: subId,
          faculty: fac._id,
          room: `Room ${101 + (chosenFacIdx % 50)}`,
          isLab: false
        });
      }
      
      const tt = new Timetable({
        section: section._id,
        semester: semester._id,
        academicYear: year._id,
        department: section.department,
        dayOfWeek: day,
        periods: periods,
        isActive: true
      });
      await tt.save();
    }
  }

  // Insert all the allocations created during the process
  // Deduplicate allocations so we don't have multiples for the same sec-fac combo
  const uniqueAllocsMap = new Map();
  allocationsToInsert.forEach(a => {
    const key = `${a.faculty.toString()}-${a.section.toString()}-${a.subject.toString()}`;
    if (!uniqueAllocsMap.has(key)) {
      uniqueAllocsMap.set(key, a);
    }
  });
  const uniqueAllocs = Array.from(uniqueAllocsMap.values());
  await FacultyAllocation.insertMany(uniqueAllocs);

  console.log(`Successfully generated Timetables for ${DAYS.length} days and ${sections.length} sections!`);
  console.log(`Generated ${uniqueAllocs.length} unique faculty allocations.`);
  process.exit(0);
}

run().catch(console.error);
