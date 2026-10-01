import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '../.env' });
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import Parent from '../src/models/Parent.js';

const fixParents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const hash = await bcrypt.hash('password123', 12);
    let updated = 0;

    for (let i = 1; i <= 800; i++) {
      const padNum = String(i).padStart(3, '0');
      const studentEmail = `stu${padNum}@erp.com`;
      const parentEmail = `par${padNum}@erp.com`;

      const studentUser = await User.findOne({ email: studentEmail });
      if (!studentUser) continue;

      const studentDoc = await Student.findOne({ user: studentUser._id });
      if (!studentDoc) continue;

      // Upsert Parent User
      const parentUser = await User.findOneAndUpdate(
        { email: parentEmail },
        {
          name: `Parent of ${studentUser.name}`,
          email: parentEmail,
          password: hash,
          role: 'parent'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Upsert Parent Profile
      const parentDoc = await Parent.findOneAndUpdate(
        { user: parentUser._id },
        {
          user: parentUser._id,
          $addToSet: { students: studentDoc._id }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Link to Student
      await Student.findByIdAndUpdate(studentDoc._id, {
        $addToSet: { parents: parentDoc._id }
      });

      updated++;
    }

    console.log(`Successfully created and mapped ${updated} parents!`);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing parents:', err);
    process.exit(1);
  }
};

fixParents();
