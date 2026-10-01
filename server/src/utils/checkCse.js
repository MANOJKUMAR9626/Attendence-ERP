import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const cse = await Department.findOne({name: /Computer Science/i});
  console.log('CSE Dept ID:', cse._id);
  const students = await Student.find({department: cse._id}).populate('currentSemester');
  console.log('CSE Students count:', students.length);
  const yr2 = students.filter(s => [3,4].includes(s.currentSemester?.number));
  console.log('CSE 2nd year count:', yr2.length);
  process.exit(0);
}
run();
