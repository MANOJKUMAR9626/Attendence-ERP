import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import Faculty from '../src/models/Faculty.js';

const designations = [
  "Professor", 
  "Associate Professor", 
  "Assistant Professor", 
  "Lecturer", 
  "Senior Lecturer",
  "Head of Department"
];

// Weighted random to make Assistant/Associate Professors more common
const generateDesignation = () => {
  const rand = Math.random();
  if (rand < 0.1) return "Head of Department";
  if (rand < 0.25) return "Professor";
  if (rand < 0.5) return "Associate Professor";
  if (rand < 0.85) return "Assistant Professor";
  return "Lecturer";
};

const updateFacultyDesignations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const faculties = await Faculty.find();
    console.log(`Found ${faculties.length} faculty records.`);

    let updated = 0;
    for (let fac of faculties) {
      if (!fac.designation || fac.designation.trim() === '') {
        fac.designation = generateDesignation();
        await fac.save();
        updated++;
      }
    }

    console.log(`Successfully assigned designations to ${updated} faculties!`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating designations:', err);
    process.exit(1);
  }
};

updateFacultyDesignations();
