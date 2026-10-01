import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_erp')
  .then(async () => {
    try {
      const users = await User.find({}).select('+password');
      let updatedCount = 0;
      
      for (const user of users) {
        if (user.password && !user.password.startsWith('$2')) {
          console.log(`Hashing password for user: ${user.email}`);
          const hashedPassword = await bcrypt.hash(user.password, 12);
          
          // Use updateOne to bypass hooks and just force the hash into the DB
          await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
          updatedCount++;
        }
      }
      
      console.log(`Successfully hashed passwords for ${updatedCount} users.`);
    } catch (err) {
      console.error(err);
    } finally {
      process.exit(0);
    }
  });
