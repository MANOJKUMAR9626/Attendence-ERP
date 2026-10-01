import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: '../../.env' });

const seedParent = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Parent Seeding');

    // Create a parent user if one doesn't exist
    const existingParent = await User.findOne({ email: 'parent@smarterp.edu' });
    if (!existingParent) {
      await User.create({
        name: 'Ravi Kumar',
        email: 'parent@smarterp.edu',
        password: 'password123',
        role: 'parent',
        isActive: true,
        isEmailVerified: true
      });
      console.log('Parent user seeded successfully! (parent@smarterp.edu / password123)');
    } else {
      console.log('Parent user already exists. (parent@smarterp.edu / password123)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding Parent Failed:', error);
    process.exit(1);
  }
};

seedParent();
