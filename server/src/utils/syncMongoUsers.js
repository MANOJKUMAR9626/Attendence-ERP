import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  identifier: String,
  role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function syncUsers() {
  console.log('Connecting to databases...');
  
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // Connect to MySQL
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'exam_hall_management',
  });
  console.log('MySQL connected');

  try {
    // 1. Sync Students
    console.log('Fetching students from MySQL...');
    const [students] = await pool.query('SELECT student_unique_id, student_name, email FROM students');
    
    let studentUpdateCount = 0;
    for (const student of students) {
      // Find the old user by the old placeholder name
      const oldName = `Student ${student.student_unique_id}`;
      try {
        const result = await User.updateOne(
          { name: oldName, role: 'student' },
          { 
            $set: { 
              name: student.student_name, 
              email: student.email,
              identifier: student.student_unique_id
            }
          }
        );
        if (result.modifiedCount > 0) studentUpdateCount++;
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate email, make it unique
          const uniqueEmail = `${student.email.split('@')[0]}_${student.student_unique_id}@smarterp.edu`;
          const result = await User.updateOne(
            { name: oldName, role: 'student' },
            { 
              $set: { 
                name: student.student_name, 
                email: uniqueEmail,
                identifier: student.student_unique_id
              }
            }
          );
          if (result.modifiedCount > 0) studentUpdateCount++;
        }
      }
    }
    console.log(`Updated ${studentUpdateCount} student accounts in MongoDB`);

    // 2. Sync Faculty
    console.log('Fetching faculty from MySQL...');
    const [faculty] = await pool.query('SELECT faculty_code, faculty_name, email FROM faculty');
    
    let facultyUpdateCount = 0;
    for (const fac of faculty) {
      const oldName = `Faculty ${fac.faculty_code}`;
      try {
        const result = await User.updateOne(
          { name: oldName, role: { $in: ['faculty', 'hod', 'class_advisor'] } },
          { 
            $set: { 
              name: fac.faculty_name, 
              email: fac.email,
              identifier: fac.faculty_code
            }
          }
        );
        if (result.modifiedCount > 0) facultyUpdateCount++;
      } catch (err) {
         if (err.code === 11000) {
            const uniqueEmail = `${fac.email.split('@')[0]}_${fac.faculty_code}@smarterp.edu`;
            const result = await User.updateOne(
              { name: oldName, role: { $in: ['faculty', 'hod', 'class_advisor'] } },
              { $set: { name: fac.faculty_name, email: uniqueEmail, identifier: fac.faculty_code } }
            );
            if (result.modifiedCount > 0) facultyUpdateCount++;
         }
      }
    }
    console.log(`Updated ${facultyUpdateCount} faculty accounts in MongoDB`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    await pool.end();
    console.log('Done.');
  }
}

syncUsers();
