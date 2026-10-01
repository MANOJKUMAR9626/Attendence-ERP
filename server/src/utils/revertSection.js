import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import Student from '../models/Student.js';
import Section from '../models/Section.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  
  const sectionA = await Section.findOne({ name: 'A' });
  if (!sectionA) {
    console.error("Section A not found!");
    process.exit(1);
  }

  // Move all students to Section A
  await Student.updateMany({}, { $set: { section: sectionA._id } });
  
  // Delete Section B
  const sectionB = await Section.findOne({ name: 'B' });
  if (sectionB) {
    await Section.deleteOne({ _id: sectionB._id });
  }

  console.log("Moved all students back to Section A and deleted Section B.");
  process.exit(0);
}

run().catch(console.error);
