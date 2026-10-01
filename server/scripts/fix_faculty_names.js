import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import User from '../src/models/User.js';

const facultyFirstNames = [
  "Ramesh", "Suresh", "Manoj", "Karthik", "Ravi", "Anand", "Deepak", "Vikram", "Sanjay", "Rajesh",
  "Priya", "Anitha", "Kavitha", "Lakshmi", "Meena", "Geetha", "Sujatha", "Radha", "Nithya", "Deepa",
  "Arun", "Bala", "Chandran", "Dinesh", "Ganesh", "Hari", "Jay", "Krishna", "Mohan", "Naveen",
  "Prabhu", "Ram", "Shankar", "Venkatesh", "Vijay", "Anandhi", "Bhavani", "Chitra", "Divya", "Gowri"
];

const generateRandomFacultyName = () => {
  return facultyFirstNames[Math.floor(Math.random() * facultyFirstNames.length)];
};

const updateFacultyNames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const faculties = await User.find({ role: 'faculty' });
    console.log(`Found ${faculties.length} faculty users.`);

    for (let user of faculties) {
      if (user.name.startsWith('Faculty FAC')) {
        user.name = generateRandomFacultyName();
        await user.save();
      }
    }

    console.log('Successfully updated faculty names with realistic first names!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating faculty names:', err);
    process.exit(1);
  }
};

updateFacultyNames();
