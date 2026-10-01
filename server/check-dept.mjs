import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://localhost:27017/attendance_erp');
  const db = mongoose.connection.db;

  const sampleFaculty = await db.collection('faculties').aggregate([
    { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'deptInfo' } },
    { $limit: 3 }
  ]).toArray();

  console.log('Sample Faculties:');
  sampleFaculty.forEach(f => console.log(f._id, 'Dept:', f.deptInfo[0]?.name));

  const sampleSubject = await db.collection('subjects').aggregate([
    { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'deptInfo' } },
    { $limit: 3 }
  ]).toArray();

  console.log('\nSample Subjects:');
  sampleSubject.forEach(s => console.log(s.name, 'Dept:', s.deptInfo[0]?.name));

  const alloc = await db.collection('facultyallocations').findOne({});
  if (alloc) {
    const fac = await db.collection('faculties').findOne({ _id: alloc.faculty });
    const sub = await db.collection('subjects').findOne({ _id: alloc.subject });
    console.log('\nSample Allocation:');
    console.log('Faculty Dept:', fac.department);
    console.log('Subject Dept:', sub.department);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
