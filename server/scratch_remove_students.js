import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/attendance_erp').then(async () => {
  const db = mongoose.connection.db;
  const departments = await db.collection('departments').find().toArray();
  
  let totalDeleted = 0;
  for (const dept of departments) {
    // Find students in this dept, keep first 10, delete rest
    const students = await db.collection('students').find({ department: dept._id }).toArray();
    if (students.length > 10) {
      const toDelete = students.slice(10).map(s => s._id);
      const res = await db.collection('students').deleteMany({ _id: { $in: toDelete } });
      totalDeleted += res.deletedCount;
    }
  }
  
  // Update all sections to have currentStrength 10
  await db.collection('sections').updateMany({}, { $set: { currentStrength: 10 } });
  
  console.log('Deleted extra students:', totalDeleted);
  console.log('Updated sections strength to 10');
  process.exit(0);
});
