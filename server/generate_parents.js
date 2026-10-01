import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Parent from './src/models/Parent.js';
import Student from './src/models/Student.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_erp')
  .then(async () => {
    try {
      console.log('Fetching students...');
      const students = await Student.find({}).select('_id parents').lean();
      console.log(`Found ${students.length} students. generating parents...`);

      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const usersToInsert = [];
      
      for (let i = 0; i < students.length; i++) {
        const pIdStr = String(i + 1).padStart(3, '0');
        const parName = `PAR${pIdStr}`;
        const parEmail = `par${pIdStr}@smarterp.edu`;
        
        usersToInsert.push({
          name: parName,
          email: parEmail,
          password: hashedPassword,
          role: 'parent',
          isActive: true
        });
      }
      
      console.log(`Inserting ${usersToInsert.length} parent users...`);
      const insertedUsers = await User.insertMany(usersToInsert);
      console.log(`Inserted ${insertedUsers.length} parent users.`);
      
      const parentsToInsert = [];
      for (let i = 0; i < insertedUsers.length; i++) {
        parentsToInsert.push({
          user: insertedUsers[i]._id,
          students: [students[i]._id],
          relation: 'Father',
          isActive: true
        });
      }
      
      console.log(`Inserting ${parentsToInsert.length} parent records...`);
      const insertedParents = await Parent.insertMany(parentsToInsert);
      console.log(`Inserted ${insertedParents.length} parent records.`);
      
      console.log('Updating students to reference their parent...');
      
      const bulkOps = [];
      for (let i = 0; i < students.length; i++) {
        bulkOps.push({
          updateOne: {
            filter: { _id: students[i]._id },
            update: { $set: { parents: [insertedParents[i]._id] } }
          }
        });
        
        if (bulkOps.length === 1000) {
          await Student.bulkWrite(bulkOps);
          bulkOps.length = 0;
          console.log(`Updated 1000 students...`);
        }
      }
      
      if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps);
        console.log(`Updated remaining students...`);
      }
      
      console.log('Successfully generated parents and linked them to students!');
    } catch (err) {
      console.error('Error generating parents:', err);
    } finally {
      process.exit(0);
    }
  });
