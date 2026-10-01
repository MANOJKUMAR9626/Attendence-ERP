import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} students. Updating...`);
    
    let updatedCount = 0;
    for (const student of students) {
      student.phone = '1234567890';
      
      // Use dicebear for beautiful, consistent avatars
      const seed = encodeURIComponent(student.name || student.email || student._id);
      student.avatar = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&size=128&backgroundColor=e2e8f0`;
      
      await student.save();
      updatedCount++;
    }
    
    console.log(`Successfully updated ${updatedCount} students.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
