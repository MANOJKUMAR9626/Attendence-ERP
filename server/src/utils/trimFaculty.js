import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import FacultyAllocation from '../models/FacultyAllocation.js';

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';
  await mongoose.connect(mongoUri);
  console.log('MongoDB Connected');
  
  const depts = await Department.find({});
  let totalDeleted = 0;
  let totalKept = 0;
  
  for (const d of depts) {
    const facultyList = await Faculty.find({ department: d._id });
    if (facultyList.length > 5) {
      const toKeep = facultyList.slice(0, 5);
      const toDelete = facultyList.slice(5);
      
      const keepIds = toKeep.map(f => f._id);
      const deleteIds = toDelete.map(f => f._id);
      const deleteUserIds = toDelete.map(f => f.user);
      
      // Also delete any allocations for deleted faculty
      await FacultyAllocation.deleteMany({ faculty: { $in: deleteIds } });
      await User.deleteMany({ _id: { $in: deleteUserIds } });
      await Faculty.deleteMany({ _id: { $in: deleteIds } });
      
      totalDeleted += deleteIds.length;
      totalKept += toKeep.length;
    } else {
      totalKept += facultyList.length;
    }
  }
  
  console.log(`Trimmed faculty. Kept: ${totalKept}, Deleted: ${totalDeleted}`);
  process.exit(0);
}

run().catch(console.error);
