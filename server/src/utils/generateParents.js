import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const students = await Student.find({}).sort({_id:1});
  
  let i = 1;
  let userOps = [];
  let parentOps = [];
  
  // Clean up any old parents we mocked just in case
  await Parent.deleteMany({});
  await User.deleteMany({ role: 'parent' });

  for(const s of students) {
    const pId = 'PAR' + String(i).padStart(3, '0');
    const pEmail = `parent${i}@smarterp.edu`;
    const userId = new mongoose.Types.ObjectId();
    
    userOps.push({ insertOne: { document: { _id: userId, name: 'Parent of ' + s.registerNumber, email: pEmail, password: 'password123', role: 'parent', identifier: pId, isActive: true } } });
    
    const parentId = new mongoose.Types.ObjectId();
    parentOps.push({ insertOne: { document: { _id: parentId, user: userId, students: [s._id] } } });
    
    s.parents = [parentId];
    await s.save();
    i++;
  }
  
  await User.bulkWrite(userOps);
  await Parent.bulkWrite(parentOps);
  
  console.log('Generated ' + students.length + ' unique parents.');
  process.exit(0);
}
run().catch(console.error);
