import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './src/models/Faculty.js';
import User from './src/models/User.js';
import Department from './src/models/Department.js';
import Student from './src/models/Student.js';
import Section from './src/models/Section.js';
import Semester from './src/models/Semester.js';
import Subject from './src/models/Subject.js';
import Timetable from './src/models/Timetable.js';
import AcademicYear from './src/models/AcademicYear.js';
import Course from './src/models/Course.js';

dotenv.config();

const defaultTimings = [
  { periodNumber: 1, startTime: '09:00', endTime: '10:00' },
  { periodNumber: 2, startTime: '10:15', endTime: '11:15' },
  { periodNumber: 3, startTime: '11:30', endTime: '12:30' },
  { periodNumber: 4, startTime: '13:30', endTime: '14:30' },
  { periodNumber: 5, startTime: '14:45', endTime: '15:45' }
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_erp');
  console.log('Connected to MongoDB');

  const academicYear = await AcademicYear.findOne();
  const course = await Course.findOne();
  const semesters = await Semester.find().sort('number');
  const departments = await Department.find();

  console.log('Cleaning up old timetables, sections, subjects...');
  await Timetable.deleteMany({});
  await Subject.deleteMany({});
  await Section.deleteMany({});

  const allFaculties = await Faculty.find().populate('user');
  const facultiesByDept = {};
  for (const fac of allFaculties) {
    if (!fac.department) continue;
    const dId = fac.department.toString();
    if (!facultiesByDept[dId]) facultiesByDept[dId] = [];
    facultiesByDept[dId].push(fac._id);
  }

  const allStudents = await Student.find().select('_id department currentSemester section');
  let sectionsCreated = 0;
  let studentsUpdated = 0;
  let bulkStudentUpdates = [];

  for (const dept of departments) {
    const deptIdStr = dept._id.toString();
    const facList = facultiesByDept[deptIdStr] || [];
    if (facList.length === 0) continue;

    const N = facList.length; // Number of sections = Number of faculties
    
    // Find all students in this dept
    const deptStudents = allStudents.filter(s => s.department?.toString() === deptIdStr);
    
    // We will distribute the deptStudents across the N sections evenly
    // But sections need a semester. We will cycle through the semesters (1 to 8)
    
    const sections = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < N; i++) {
      const sem = semesters[i % semesters.length];
      
      const secName = letters[i % 26] + (Math.floor(i / 26) > 0 ? Math.floor(i / 26) : '');
      const section = await Section.create({
        name: secName,
        department: dept._id,
        course: course._id,
        semester: sem._id,
        academicYear: academicYear._id,
        currentStrength: 0,
        maxStrength: 60
      });
      sections.push({ section, sem });
      sectionsCreated++;
    }

    // Distribute students
    for (let i = 0; i < deptStudents.length; i++) {
      const st = deptStudents[i];
      const secObj = sections[i % N];
      
      secObj.section.currentStrength++;
      bulkStudentUpdates.push({
        updateOne: { 
          filter: { _id: st._id }, 
          update: { $set: { section: secObj.section._id, currentSemester: secObj.sem._id } } 
        }
      });
      studentsUpdated++;
      if (bulkStudentUpdates.length >= 1000) {
        await Student.bulkWrite(bulkStudentUpdates);
        bulkStudentUpdates = [];
      }
    }
    
    // Save updated strengths
    for (const secObj of sections) {
      await secObj.section.save();
    }

    // Generate subjects per section
    for (const secObj of sections) {
      const sem = secObj.sem;
      const subjects = [];
      for (let i = 1; i <= 5; i++) {
        const subj = await Subject.create({
          name: `${dept.name} Core ${sem.number}.${i}`,
          code: `${dept.code}${sem.number}0${i}`,
          department: dept._id,
          course: course._id,
          semester: sem._id,
          type: 'Theory'
        });
        subjects.push(subj);
      }
      secObj.subjects = subjects;
    }

    // Generate Timetable with Round-Robin Faculty Assignment
    for (const day of days) {
      for (let secIdx = 0; secIdx < N; secIdx++) {
        const secObj = sections[secIdx];
        const periods = [];
        
        for (let pIdx = 0; pIdx < 5; pIdx++) {
          const facIdx = (secIdx + pIdx) % N;
          const facId = facList[facIdx];
          const subj = secObj.subjects[pIdx];
          
          periods.push({
            periodNumber: defaultTimings[pIdx].periodNumber,
            startTime: defaultTimings[pIdx].startTime,
            endTime: defaultTimings[pIdx].endTime,
            subject: subj._id,
            faculty: facId,
            room: `Room ${100 + secIdx}`,
            isLab: false
          });
        }
        
        await Timetable.create({
          section: secObj.section._id,
          semester: secObj.sem._id,
          academicYear: academicYear._id,
          department: dept._id,
          dayOfWeek: day,
          periods: periods
        });
      }
    }
  }

  if (bulkStudentUpdates.length > 0) {
    await Student.bulkWrite(bulkStudentUpdates);
  }

  console.log(`Created ${sectionsCreated} sections, assigned to ${studentsUpdated} students.`);
  console.log(`Generated dynamic timetables where EVERY faculty teaches exactly 5 periods a day!`);
  
  process.exit(0);
}

run().catch(console.error);
