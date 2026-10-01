import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import User from '../models/User.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  await User.updateMany({ role: 'faculty' }, { $set: { password: hashedPassword } });
  
  // Might as well fix parent passwords too just in case they were broken
  await User.updateMany({ role: 'parent' }, { $set: { password: hashedPassword } });

  console.log('Fixed user passwords');
  process.exit(0);
}
run().catch(console.error);
