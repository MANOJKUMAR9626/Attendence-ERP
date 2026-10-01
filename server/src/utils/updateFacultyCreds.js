import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const faculties = await Faculty.find({}).sort({_id:1});
  
  let i = 1;
  let userOps = [];
  let facOps = [];

  for(const f of faculties) {
    const fId = 'FAC' + String(i).padStart(3, '0');
    const fEmail = `fac${String(i).padStart(3, '0')}@smarterp.edu`;
    
    userOps.push({
      updateOne: {
        filter: { _id: f.user },
        update: { $set: { email: fEmail, identifier: fId, password: 'password123' } }
      }
    });

    facOps.push({
      updateOne: {
        filter: { _id: f._id },
        update: { $set: { employeeId: fId } }
      }
    });
    
    i++;
  }
  
  if (userOps.length > 0) {
    await User.bulkWrite(userOps);
    await Faculty.bulkWrite(facOps);
  }
  
  console.log('Updated ' + faculties.length + ' faculty credentials.');
  process.exit(0);
}
run().catch(console.error);
