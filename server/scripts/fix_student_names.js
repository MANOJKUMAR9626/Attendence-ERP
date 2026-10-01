import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import User from '../src/models/User.js';

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Atharv", "Ananya", "Aadhya", "Diya", "Saanvi", "Avni", "Kavya", "Kiara", "Isha",
  "Riya", "Myra", "Neha", "Priya", "Aditi", "Rahul", "Rohan", "Vikram", "Sanjay", "Karan",
  "Pooja", "Sneha", "Kriti", "Shreya", "Nisha", "Manoj", "Karthik", "Abhishek", "Deepak", "Suresh"
];

const lastNames = [
  "Kumar", "Singh", "Sharma", "Patel", "Reddy", "Rao", "Gupta", "Nair", "Iyer", "Pillai",
  "Deshmukh", "Patil", "Joshi", "Kulkarni", "Deshpande", "Bhatt", "Chauhan", "Rajput", "Yadav", "Verma",
  "Iyer", "Menon", "Balakrishnan", "Srinivasan", "Venkatesh", "Ramachandran", "Krishnan", "Iyer", "Swaminathan", "Natarajan"
];

const generateRandomName = () => {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
};

const updateStudentNames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} student users.`);

    for (let user of students) {
      // If it already has a space (i.e. first + last name), strip the last name
      if (user.name.includes(' ')) {
        user.name = user.name.split(' ')[0];
        await user.save();
      }
    }

    console.log('Successfully updated student names with realistic data!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating student names:', err);
    process.exit(1);
  }
};

updateStudentNames();
