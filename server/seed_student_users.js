import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Student from './src/models/Student.js';
import User from './src/models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_erp');
  console.log('Connected to MongoDB');

  const students = await Student.find().select('user').lean();
  console.log(`Total students: ${students.length}`);

  const hashedPassword = await bcrypt.hash('password123', 10);
  let updated = 0;
  const bulkOps = [];

  for (let i = 0; i < students.length; i++) {
    const index = i + 1;
    const paddedIndex = String(index).padStart(4, '0'); // stu0001 - stu7680
    const email = `stu${paddedIndex}@smarterp.edu`;

    bulkOps.push({
      updateOne: {
        filter: { _id: students[i].user },
        update: {
          $set: {
            email: email,
            password: hashedPassword
          }
        }
      }
    });

    // Execute in batches of 500
    if (bulkOps.length === 500) {
      await User.bulkWrite(bulkOps);
      updated += bulkOps.length;
      bulkOps.length = 0;
      console.log(`Updated ${updated}/${students.length}...`);
    }
  }

  // Flush remaining
  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps);
    updated += bulkOps.length;
  }

  console.log(`\nDone! Updated ${updated} student accounts.`);
  console.log(`Login with: stu0001@smarterp.edu to stu${String(students.length).padStart(4, '0')}@smarterp.edu`);
  console.log(`Password: password123`);

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
