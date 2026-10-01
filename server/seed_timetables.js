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

const departmentFacultyCounts = {
  'biomedical': 10,
  'civil': 13,
  'computer science and design': 20,
  'computer science and engineering': 18,
  'electrical and electronics engineering': 24,
  'electronics and communication engineering': 18,
  'electronics and instrumentation engineering': 17,
  'information science and engineering': 13,
  'mechanical engineering': 14,
  'mechatronics engineering': 14,
  'agricultural engineering': 35,
  'artificial intelligence and data science': 50,
  'artificial inteligence and machine learning': 17,
  'biotechnology': 30,
  'computer science and business systems': 19,
  'computer technology': 14,
  'food technology': 12,
  'informmation technology': 24,
  'fshion technology': 25,
  'textile technology': 23
};

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

  console.log('Adjusting Faculties to match constraints...');
  const allFaculties = await Faculty.find().populate('user');
  let currentFacultyIndex = 0;
  
  for (const [deptNameRaw, count] of Object.entries(departmentFacultyCounts)) {
    const searchName = deptNameRaw.trim().replace(/\s+/g, '').toLowerCase();
    let dept = departments.find(d => d.name.replace(/\s+/g, '').toLowerCase().includes(searchName) || searchName.includes(d.name.replace(/\s+/g, '').toLowerCase()));
    
    if (!dept) {
       if (deptNameRaw.includes('informmation')) dept = departments.find(d => d.name.toLowerCase().includes('information tech'));
       if (deptNameRaw.includes('fshion')) dept = departments.find(d => d.name.toLowerCase().includes('fashion tech'));
       if (deptNameRaw.includes('mechanical')) dept = departments.find(d => d.name.toLowerCase().includes('mechanical'));
    }

    if (!dept) {
      console.log(`Could not find department matching ${deptNameRaw}`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      if (currentFacultyIndex < allFaculties.length) {
        allFaculties[currentFacultyIndex].department = dept._id;
        await allFaculties[currentFacultyIndex].save();
        currentFacultyIndex++;
      }
    }
  }
  console.log(`Assigned ${currentFacultyIndex} faculties.`);

  console.log('Cleaning up old timetables, sections, subjects...');
  await Timetable.deleteMany({});
  await Subject.deleteMany({});
  await Section.deleteMany({});

  console.log('Generating Sections and updating students...');
  const allStudents = await Student.find().select('_id department currentSemester section');
  let sectionsCreated = 0;
  let studentsUpdated = 0;
  let bulkStudentUpdates = [];
  
  const facultiesByDept = {};
  for (const fac of allFaculties) {
    if (!fac.department) continue;
    const dId = fac.department.toString();
    if (!facultiesByDept[dId]) facultiesByDept[dId] = [];
    facultiesByDept[dId].push(fac._id);
  }

  for (const dept of departments) {
    const deptIdStr = dept._id.toString();
    for (const sem of semesters) {
      const semStudents = allStudents.filter(s => s.department?.toString() === deptIdStr && s.currentSemester?.toString() === sem._id.toString());
      if (semStudents.length === 0) continue;

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

      const numSections = Math.ceil(semStudents.length / 60) || 1;
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      for (let secIdx = 0; secIdx < numSections; secIdx++) {
        const secName = letters[secIdx] || 'A';
        const section = await Section.create({
          name: secName,
          department: dept._id,
          course: course._id,
          semester: sem._id,
          academicYear: academicYear._id,
          currentStrength: 0,
          maxStrength: 60
        });
        sectionsCreated++;

        const studentsInSection = semStudents.slice(secIdx * 60, (secIdx + 1) * 60);
        section.currentStrength = studentsInSection.length;
        await section.save();

        for (const st of studentsInSection) {
          bulkStudentUpdates.push({
            updateOne: { filter: { _id: st._id }, update: { $set: { section: section._id } } }
          });
          studentsUpdated++;
          if (bulkStudentUpdates.length >= 1000) {
            await Student.bulkWrite(bulkStudentUpdates);
            bulkStudentUpdates = [];
          }
        }

        const facList = facultiesByDept[deptIdStr] || [];
        for (const day of days) {
          const periods = [];
          for (let pIdx = 0; pIdx < 5; pIdx++) {
            const subj = subjects[pIdx % subjects.length];
            const fac = facList.length > 0 ? facList[Math.floor(Math.random() * facList.length)] : null;
            if (fac) {
              periods.push({
                periodNumber: defaultTimings[pIdx].periodNumber,
                startTime: defaultTimings[pIdx].startTime,
                endTime: defaultTimings[pIdx].endTime,
                subject: subj._id,
                faculty: fac,
                room: `Room ${100 + secIdx + sem.number}`,
                isLab: false
              });
            }
          }
          if (periods.length > 0) {
            await Timetable.create({
              section: section._id,
              semester: sem._id,
              academicYear: academicYear._id,
              department: dept._id,
              dayOfWeek: day,
              periods: periods
            });
          }
        }
      }
    }
  }

  if (bulkStudentUpdates.length > 0) {
    await Student.bulkWrite(bulkStudentUpdates);
  }

  console.log(`Created ${sectionsCreated} sections, assigned to ${studentsUpdated} students.`);
  console.log(`Generated dynamic timetables successfully!`);
  
  process.exit(0);
}

run().catch(console.error);
