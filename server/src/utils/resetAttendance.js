import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import Student from '../models/Student.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  
  const result = await Student.updateMany({}, {
    $set: {
      'attendanceSummary.overallPercentage': 0,
      'attendanceSummary.totalPresent': 0,
      'attendanceSummary.totalAbsent': 0,
      'attendanceSummary.totalClasses': 0,
      'attendanceSummary.lastUpdated': new Date(),
      'attendanceStreak': 0,
      'aiRiskLevel': 'Low'
    }
  });
  
  console.log(`Reset attendance for ${result.modifiedCount} students.`);
  process.exit(0);
}

run().catch(console.error);
