import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('password123', 12);
  const result = await db.collection('users').updateMany(
    { password: 'password123' },
    { $set: { password: hash } }
  );
  console.log(`Passwords fixed for ${result.modifiedCount} users.`);
  process.exit(0);
}).catch(console.error);
