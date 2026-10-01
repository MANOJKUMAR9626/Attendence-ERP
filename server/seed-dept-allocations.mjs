import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';
const TIME_SLOTS = [
  { periodNumber: 1, startTime: '09:00', endTime: '10:00' },
  { periodNumber: 2, startTime: '10:15', endTime: '11:15' },
  { periodNumber: 3, startTime: '11:30', endTime: '12:30' },
  { periodNumber: 4, startTime: '13:15', endTime: '14:15' },
  { periodNumber: 5, startTime: '14:30', endTime: '15:30' },
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function main() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  console.log('🗑 Clearing old Allocations and Timetables...');
  await db.collection('facultyallocations').deleteMany({});
  await db.collection('timetables').deleteMany({});

  const depts = await db.collection('departments').find().toArray();
  let allocCount = 0;
  let ttCount = 0;

  for (const dept of depts) {
    const faculties = await db.collection('faculties').find({ department: dept._id }).toArray();
    if (faculties.length === 0) continue;

    const subjects = await db.collection('subjects').find({ department: dept._id }).toArray();
    let sections = await db.collection('sections').find({ department: dept._id }).toArray();
    
    // If no sections for this dept, fetch any section or create one fallback? 
    // We can just use the first available section if this dept has none, or fetch all sections to fallback
    if (sections.length === 0) {
       sections = await db.collection('sections').find().limit(2).toArray();
    }

    if (subjects.length === 0) {
      console.log(`⚠️ No subjects found for ${dept.name}`);
      continue;
    }

    // Distribute subjects
    for (let fi = 0; fi < faculties.length; fi++) {
      const fac = faculties[fi];
      
      const mySubjects = [];
      for (let i = 0; i < 5; i++) {
         // Pick 5 varied subjects by jumping through the array
         const subj = subjects[(fi + i * 7) % subjects.length];
         mySubjects.push(subj);
      }

      // 1. Create allocations
      const periodData = [];
      for (const subj of mySubjects) {
         // Find a section that matches this subject's semester
         let subjSection = sections.find(s => s.semester?.toString() === subj.semester?.toString());
         if (!subjSection) {
            // Fallback to any section if none match the exact semester
            subjSection = sections[(fi + subj.name.length) % sections.length];
         }

         await db.collection('facultyallocations').insertOne({
           faculty: fac._id,
           subject: subj._id,
           section: subjSection._id,
           semester: subj.semester,
           academicYear: subjSection.academicYear,
           department: dept._id,
           isActive: true,
           createdAt: new Date(),
           updatedAt: new Date()
         });
         allocCount++;

         periodData.push({
            subject: subj._id,
            section: subjSection._id,
            semester: subj.semester,
            academicYear: subjSection.academicYear
         });
      }

      // 2. Create timetables for each day
      for (const day of DAYS) {
         for (let idx = 0; idx < periodData.length; idx++) {
           const data = periodData[idx];
           const period = {
             _id: new mongoose.Types.ObjectId(),
             periodNumber: idx + 1,
             startTime: TIME_SLOTS[idx].startTime,
             endTime: TIME_SLOTS[idx].endTime,
             subject: data.subject,
             faculty: fac._id,
             room: `Room ${101 + idx + (fi % 10)}`, // Vary room numbers
             isLab: false
           };

           // Create a separate timetable doc per class so Section and Semester are accurate for that class
           await db.collection('timetables').insertOne({
             dayOfWeek: day,
             section: data.section,
             semester: data.semester,
             academicYear: data.academicYear,
             department: dept._id,
             periods: [period], // just one period per doc
             isActive: true,
             createdAt: new Date(),
             updatedAt: new Date()
           });
           ttCount++;
         }
      }
    }
  }

  console.log(`✅ Created ${allocCount} Department-Based Allocations!`);
  console.log(`✅ Created ${ttCount} Department-Based Timetables!`);
  await mongoose.disconnect();
}

main().catch(console.error);
