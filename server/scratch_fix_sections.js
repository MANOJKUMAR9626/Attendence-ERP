import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/attendance_erp').then(async () => {
  const db = mongoose.connection.db;
  
  const departments = await db.collection('departments').find().toArray();
  console.log(`Found ${departments.length} departments.`);

  // Delete all existing faculty allocations since we will recreate them properly
  await db.collection('facultyallocations').deleteMany({});
  
  // We'll also recreate sections cleanly. 
  // Let's delete all existing sections first to avoid duplicates
  await db.collection('sections').deleteMany({});

  for (const dept of departments) {
    // 1. Create a Section A for this department
    const section = {
      _id: new mongoose.Types.ObjectId(),
      name: 'A',
      department: dept._id,
      currentStrength: 40,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('sections').insertOne(section);
    console.log(`Created Section A for ${dept.name}`);

    // 2. Assign all students in this dept to this section
    const studentRes = await db.collection('students').updateMany(
      { department: dept._id },
      { $set: { section: section._id } }
    );
    console.log(`  Assigned ${studentRes.modifiedCount} students to this section.`);

    // 3. Create Faculty Allocations (1 faculty -> 1 subject for this section)
    const faculties = await db.collection('faculties').find({ department: dept._id }).toArray();
    const subjects = await db.collection('subjects').find({ department: dept._id }).toArray();

    let count = 0;
    for (let i = 0; i < faculties.length; i++) {
      if (subjects[i]) {
        await db.collection('facultyallocations').insertOne({
          _id: new mongoose.Types.ObjectId(),
          faculty: faculties[i]._id,
          subject: subjects[i]._id,
          section: section._id,
          department: dept._id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        count++;
      }
    }
    console.log(`  Created ${count} faculty allocations.`);
  }

  console.log('Database fix complete!');
  process.exit(0);
}).catch(console.error);
