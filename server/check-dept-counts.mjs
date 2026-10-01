import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const db = mongoose.connection.db;

  const depts = await db.collection('departments').find().toArray();
  console.log('Departments:');
  for (const d of depts) {
    const facCount = await db.collection('faculties').countDocuments({ department: d._id });
    const subCount = await db.collection('subjects').countDocuments({ department: d._id });
    console.log('-', d.name, '(facs:', facCount, ', subs:', subCount, ')');
  }

  await mongoose.disconnect();
}
main().catch(console.error);
