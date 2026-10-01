import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const departments = await Department.find({});
  
  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Assistant Professor' // 5th faculty gets this
  ];

  let totalUpdated = 0;

  for (const dept of departments) {
    const faculties = await Faculty.find({ department: dept._id }).sort({ _id: 1 });
    
    for (let i = 0; i < faculties.length; i++) {
      const fac = faculties[i];
      const desig = designations[i % designations.length];
      
      const updateData = { designation: desig };
      
      // Make the Professor the HOD
      if (desig === 'Professor') {
        updateData.isHOD = true;
      } else {
        updateData.isHOD = false;
      }

      await Faculty.updateOne({ _id: fac._id }, { $set: updateData });
      totalUpdated++;
    }
  }

  console.log(`Updated designations for ${totalUpdated} faculty members.`);
  process.exit(0);
}

run().catch(console.error);
