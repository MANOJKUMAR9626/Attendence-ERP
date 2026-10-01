
import mongoose from 'mongoose';
import Faculty from './src/models/Faculty.js';
import User from './src/models/User.js';
import FacultyAllocation from './src/models/FacultyAllocation.js';

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/attendance_erp');
  const extraFaculties = await Faculty.find({ employeeId: { $in: ['FAC101', 'FAC102', 'FAC103', 'FAC104', 'FAC105'] } });
  
  for (const fac of extraFaculties) {
    if (fac.user) await User.findByIdAndDelete(fac.user);
    await FacultyAllocation.deleteMany({ faculty: fac._id });
    await Faculty.findByIdAndDelete(fac._id);
  }
  
  const remaining = await Faculty.countDocuments();
  console.log('Remaining faculty count:', remaining);
  process.exit(0);
}
run();

