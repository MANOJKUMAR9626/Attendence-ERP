import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import Student from '../models/Student.js';
import Section from '../models/Section.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  
  // Ensure both Section A and Section B exist
  let sectionA = await Section.findOne({ name: 'A' });
  if (!sectionA) {
    sectionA = await Section.create({ name: 'A', capacity: 60 });
  }
  
  let sectionB = await Section.findOne({ name: 'B' });
  if (!sectionB) {
    // Clone properties from A (like semester, dept, course) but we don't strictly need them populated globally if it's mock
    sectionB = await Section.create({ name: 'B', capacity: 60 });
  }

  const students = await Student.find({});
  let aCount = 0;
  let bCount = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    // Assign exactly half to A and half to B
    if (i % 2 === 0) {
      s.section = sectionA._id;
      aCount++;
    } else {
      s.section = sectionB._id;
      bCount++;
    }
    await s.save();
  }

  console.log(`Updated sections. Section A: ${aCount} students, Section B: ${bCount} students.`);
  process.exit(0);
}

run().catch(console.error);
