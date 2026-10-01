import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import Section from '../src/models/Section.js';
import Student from '../src/models/Student.js';

const fixStudentCount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const sections = await Section.find();
    console.log(`Found ${sections.length} sections to update.`);

    for (let section of sections) {
      const studentCount = await Student.countDocuments({ section: section._id });
      section.currentStrength = studentCount;
      await section.save();
    }

    console.log('Successfully updated currentStrength for all sections!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing student counts:', err);
    process.exit(1);
  }
};

fixStudentCount();
