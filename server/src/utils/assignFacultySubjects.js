import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});

import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';
import Subject from '../models/Subject.js';
import FacultyAllocation from '../models/FacultyAllocation.js';
import Course from '../models/Course.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  console.log('MongoDB connected');

  // Clear existing subjects and allocations
  await Subject.deleteMany({});
  await FacultyAllocation.deleteMany({});

  const course = await Course.findOne();
  const acadYear = await AcademicYear.findOne();
  const semester = await Semester.findOne({ number: 1 });
  const section = await Section.findOne({ name: 'A' });

  if (!course || !acadYear || !semester || !section) {
    console.error("Missing core required records (Course, AcadYear, Semester, Section).");
    process.exit(1);
  }

  const departments = await Department.find({});
  let totalSubjects = 0;
  let totalAllocations = 0;

  for (const dept of departments) {
    const faculties = await Faculty.find({ department: dept._id });
    
    // For each faculty in the department, create one subject and assign it to them
    let idx = 1;
    for (const fac of faculties) {
      const code = `${dept.code || dept.name.substring(0,3).toUpperCase()}${100 + idx}`;
      
      const newSub = await Subject.create({
        name: `${dept.name} Subject ${idx}`,
        code: code,
        department: dept._id,
        course: course._id,
        semester: semester._id,
        type: 'Theory',
        credits: 3
      });
      totalSubjects++;

      await FacultyAllocation.create({
        faculty: fac._id,
        subject: newSub._id,
        section: section._id,
        academicYear: acadYear._id,
        semester: semester._id,
        department: dept._id
      });
      totalAllocations++;
      idx++;
    }
  }

  console.log(`Created ${totalSubjects} Subjects and assigned ${totalAllocations} Faculty Allocations!`);
  process.exit(0);
}

run().catch(console.error);
