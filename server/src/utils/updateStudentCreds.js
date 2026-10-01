import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import User from '../models/User.js';
import Student from '../models/Student.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const students = await Student.find({}).sort({_id:1});
  
  let i = 1;
  let userOps = [];
  let stuOps = [];
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  for(const s of students) {
    const sId = 'STU' + String(i).padStart(3, '0');
    const sEmail = `stu${String(i).padStart(3, '0')}@smarterp.edu`;
    
    userOps.push({
      updateOne: {
        filter: { _id: s.user },
        update: { $set: { email: sEmail, identifier: sId, password: hashedPassword } }
      }
    });

    stuOps.push({
      updateOne: {
        filter: { _id: s._id },
        update: { $set: { registerNumber: sId, roll_number: sId } }
      }
    });
    
    i++;
  }
  
  if (userOps.length > 0) {
    await User.bulkWrite(userOps);
    await Student.bulkWrite(stuOps);
  }
  
  console.log('Updated ' + students.length + ' student credentials to STU... format.');
  process.exit(0);
}

run().catch(console.error);
