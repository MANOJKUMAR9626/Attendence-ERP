import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import Student from '../models/Student.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  
  const result = await Student.updateMany({}, {
    $set: {
      'aiRiskLevel': 'NA'
    }
  });
  
  console.log(`Updated AI risk level to NA for ${result.modifiedCount} students.`);
  process.exit(0);
}

run().catch(console.error);
