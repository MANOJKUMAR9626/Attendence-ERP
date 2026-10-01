/**
 * Seed Script: Add Saturday timetables (5 periods per faculty)
 * and ensure Mon-Fri also have exactly 5 periods per faculty
 * Run: node server/seed-timetable.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';

const TIME_SLOTS = [
  { periodNumber: 1, startTime: '09:00', endTime: '10:00' },
  { periodNumber: 2, startTime: '10:15', endTime: '11:15' },
  { periodNumber: 3, startTime: '11:30', endTime: '12:30' },
  { periodNumber: 4, startTime: '13:15', endTime: '14:15' },
  { periodNumber: 5, startTime: '14:30', endTime: '15:30' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function main() {
  console.log(`\n🔌 Connecting: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('✅ Connected!\n');

  // ── 1. Load existing Monday timetables as template ─────────────────────────
  const mondayTTs = await db.collection('timetables')
    .find({ dayOfWeek: 'Monday' })
    .toArray();

  console.log(`📋 Found ${mondayTTs.length} Monday timetables to use as template`);

  // ── 2. Add Saturday timetables (clone from Monday) ────────────────────────
  const satExisting = await db.collection('timetables').countDocuments({ dayOfWeek: 'Saturday' });
  if (satExisting > 0) {
    console.log(`⏭  Saturday already has ${satExisting} timetables — clearing them first`);
    await db.collection('timetables').deleteMany({ dayOfWeek: 'Saturday' });
  }

  console.log('\n📅 Creating Saturday timetables...');
  let satCreated = 0;

  for (const tt of mondayTTs) {
    const { _id, dayOfWeek, createdAt, updatedAt, __v, ...rest } = tt;

    // Give each period a fresh _id
    const periods = rest.periods.map((p, idx) => ({
      ...p,
      _id: new mongoose.Types.ObjectId(),
      periodNumber: idx + 1,
      startTime: TIME_SLOTS[idx]?.startTime || p.startTime,
      endTime:   TIME_SLOTS[idx]?.endTime   || p.endTime,
      room: p.room || `Room ${100 + idx + 1}`,
    }));

    try {
      await db.collection('timetables').insertOne({
        ...rest,
        dayOfWeek: 'Saturday',
        periods,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      satCreated++;
    } catch (err) {
      if (err.code !== 11000) console.error('Insert error:', err.message);
    }
  }

  console.log(`  ✅ Created ${satCreated} Saturday timetables`);

  // ── 3. Ensure all weekday timetables have exactly 5 periods ───────────────
  console.log('\n🔧 Checking/fixing period counts for Mon–Fri...');

  const allTTs = await db.collection('timetables')
    .find({ dayOfWeek: { $in: ['Monday','Tuesday','Wednesday','Thursday','Friday'] } })
    .toArray();

  let fixed = 0;
  for (const tt of allTTs) {
    if ((tt.periods?.length || 0) === 5) continue; // already correct

    const currentPeriods = tt.periods || [];
    const needed = 5 - currentPeriods.length;
    if (needed <= 0) continue;

    // Get any subject + faculty from allocations for this section+semester
    const allocs = await db.collection('facultyallocations')
      .find({ section: tt.section, semester: tt.semester, isActive: true })
      .limit(needed + 5)
      .toArray();

    const extras = [];
    for (let i = 0; i < needed; i++) {
      const alloc = allocs[currentPeriods.length + i] || allocs[i % allocs.length];
      if (!alloc) continue;
      const slotIdx = currentPeriods.length + i;
      extras.push({
        _id: new mongoose.Types.ObjectId(),
        periodNumber: slotIdx + 1,
        startTime: TIME_SLOTS[slotIdx]?.startTime || '15:45',
        endTime:   TIME_SLOTS[slotIdx]?.endTime   || '16:45',
        subject: alloc.subject,
        faculty: alloc.faculty,
        room: `Room ${100 + slotIdx + 1}`,
        isLab: false,
      });
    }

    if (extras.length > 0) {
      await db.collection('timetables').updateOne(
        { _id: tt._id },
        { $push: { periods: { $each: extras } }, $set: { updatedAt: new Date() } }
      );
      fixed++;
    }
  }

  console.log(`  ✅ Fixed ${fixed} timetables to have 5 periods`);

  // ── 4. Verify final state ──────────────────────────────────────────────────
  console.log('\n📊 Final verification:');
  for (const day of DAYS) {
    const count = await db.collection('timetables').countDocuments({ dayOfWeek: day });
    const sampleTT = await db.collection('timetables').findOne({ dayOfWeek: day });
    const avgPeriods = sampleTT?.periods?.length ?? 0;
    console.log(`  ${day.padEnd(10)}: ${count} timetables | sample has ${avgPeriods} periods`);
  }

  // Count unique faculty on a Monday
  const mondayFaculty = new Set();
  const allMonTTs = await db.collection('timetables').find({ dayOfWeek: 'Monday' }).toArray();
  allMonTTs.forEach(tt => tt.periods?.forEach(p => mondayFaculty.add(p.faculty?.toString())));
  console.log(`\n  Faculty with Monday classes: ${mondayFaculty.size}`);

  const satFaculty = new Set();
  const allSatTTs = await db.collection('timetables').find({ dayOfWeek: 'Saturday' }).toArray();
  allSatTTs.forEach(tt => tt.periods?.forEach(p => satFaculty.add(p.faculty?.toString())));
  console.log(`  Faculty with Saturday classes: ${satFaculty.size}`);

  // Check a specific faculty (fac001)
  const fac001User = await db.collection('users').findOne({ email: 'fac001@smarterp.edu' });
  if (fac001User) {
    const fac001 = await db.collection('faculties').findOne({ user: fac001User._id });
    if (fac001) {
      for (const day of DAYS) {
        const tts = await db.collection('timetables')
          .find({ 'periods.faculty': fac001._id, dayOfWeek: day })
          .toArray();
        let cnt = 0;
        tts.forEach(tt => tt.periods.forEach(p => {
          if (p.faculty?.toString() === fac001._id.toString()) cnt++;
        }));
        console.log(`  fac001 on ${day.padEnd(10)}: ${cnt} periods`);
      }
    }
  }

  console.log('\n🎉 Done! Refresh "My Classes" to see 5 classes for any day including Saturday.\n');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
