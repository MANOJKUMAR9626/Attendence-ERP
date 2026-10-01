
import mongoose from 'mongoose';
import Section from './src/models/Section.js';

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/attendance_erp');
  const result = await Section.collection.updateMany({}, { $set: { name: 'A' } });
  console.log('Updated sections:', result.modifiedCount);
  process.exit(0);
}
run();

