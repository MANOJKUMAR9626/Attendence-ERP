/**
 * Seed Script: Creates FacultyAllocations from existing DB data
 * Run: node seed-allocations.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load env
dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';

// ─── Inline Schemas ───────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({ name: String, email: String, role: String });
const FacultySchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, employeeId: String, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, isActive: Boolean });
const DepartmentSchema = new mongoose.Schema({ name: String, code: String });
const CourseSchema = new mongoose.Schema({ name: String, code: String, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' } });
const AcademicYearSchema = new mongoose.Schema({ year: String, name: String, startDate: Date, endDate: Date });
const SemesterSchema = new mongoose.Schema({ name: String, number: Number, course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' }, isActive: Boolean, isCurrent: Boolean });
const SectionSchema = new mongoose.Schema({ name: String, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }, academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' }, currentStrength: { type: Number, default: 0 }, maxStrength: { type: Number, default: 60 }, isActive: Boolean });
const SubjectSchema = new mongoose.Schema({ name: String, code: String, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }, type: String, credits: Number, hoursPerWeek: Number, isActive: { type: Boolean, default: true } });
const FacultyAllocationSchema = new mongoose.Schema({ faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }, subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }, academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' }, semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, isActive: { type: Boolean, default: true } });
FacultyAllocationSchema.index({ faculty: 1, subject: 1, section: 1, semester: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Faculty = mongoose.model('Faculty', FacultySchema);
const Department = mongoose.model('Department', DepartmentSchema);
const Course = mongoose.model('Course', CourseSchema);
const AcademicYear = mongoose.model('AcademicYear', AcademicYearSchema);
const Semester = mongoose.model('Semester', SemesterSchema);
const Section = mongoose.model('Section', SectionSchema);
const Subject = mongoose.model('Subject', SubjectSchema);
const FacultyAllocation = mongoose.model('FacultyAllocation', FacultyAllocationSchema);

async function main() {
  console.log(`\n🔌 Connecting to MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected!\n');

  // ── 1. Report existing data ────────────────────────────────────────────────
  const [faculties, departments, courses, academicYears, semesters, sections, subjects, existingAllocs] = await Promise.all([
    Faculty.find().populate('user', 'name email'),
    Department.find(),
    Course.find(),
    AcademicYear.find(),
    Semester.find(),
    Section.find(),
    Subject.find(),
    FacultyAllocation.find(),
  ]);

  console.log('📊 Current Database State:');
  console.log(`  Faculty:        ${faculties.length}`);
  console.log(`  Departments:    ${departments.length}`);
  console.log(`  Courses:        ${courses.length}`);
  console.log(`  Academic Years: ${academicYears.length}`);
  console.log(`  Semesters:      ${semesters.length}`);
  console.log(`  Sections:       ${sections.length}`);
  console.log(`  Subjects:       ${subjects.length}`);
  console.log(`  Allocations:    ${existingAllocs.length}`);
  console.log('');

  if (faculties.length === 0) {
    console.log('❌ No faculty found. Please create faculty users through the admin panel first.\n');
    await mongoose.disconnect();
    return;
  }

  // ── 2. Ensure we have an AcademicYear ─────────────────────────────────────
  let academicYear = academicYears[0];
  if (!academicYear) {
    console.log('📅 Creating Academic Year 2026-27...');
    academicYear = await AcademicYear.create({ year: '2026-27', name: 'Academic Year 2026-27', startDate: new Date('2026-06-01'), endDate: new Date('2027-04-30') });
    console.log('  ✅ Created:', academicYear.year);
  } else {
    console.log(`  ✅ Using existing Academic Year: ${academicYear.year || academicYear.name}`);
  }

  // ── 3. Ensure we have a Department ────────────────────────────────────────
  let department = departments[0];
  if (!department) {
    console.log('🏢 Creating Computer Science Department...');
    department = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE' });
    console.log('  ✅ Created:', department.name);
  } else {
    console.log(`  ✅ Using existing Department: ${department.name}`);
  }

  // ── 4. Ensure we have a Course ────────────────────────────────────────────
  let course = courses[0];
  if (!course) {
    console.log('📚 Creating B.E. CSE Course...');
    course = await Course.create({ name: 'Bachelor of Engineering', code: 'BE-CSE', department: department._id });
    console.log('  ✅ Created:', course.name);
  } else {
    console.log(`  ✅ Using existing Course: ${course.name}`);
  }

  // ── 5. Ensure we have Semesters ───────────────────────────────────────────
  let semester = semesters.find(s => s.number === 5) || semesters[0];
  if (!semester) {
    console.log('📆 Creating Semesters 1-8...');
    const semData = [];
    for (let i = 1; i <= 8; i++) {
      semData.push({ name: `Semester ${i}`, number: i, course: course._id, academicYear: academicYear._id, isActive: i === 5, isCurrent: i === 5 });
    }
    const created = await Semester.insertMany(semData);
    semester = created.find(s => s.number === 5);
    console.log(`  ✅ Created 8 semesters`);
  } else {
    console.log(`  ✅ Using existing Semester: ${semester.name}`);
  }

  // ── 6. Ensure we have Sections ────────────────────────────────────────────
  let section = sections.find(s => s.semester?.toString() === semester._id.toString()) || sections[0];
  if (!section) {
    console.log('🏫 Creating Sections A, B for the semester...');
    const sectionsData = [
      { name: 'A', department: department._id, course: course._id, semester: semester._id, academicYear: academicYear._id, currentStrength: 45, maxStrength: 60, isActive: true },
      { name: 'B', department: department._id, course: course._id, semester: semester._id, academicYear: academicYear._id, currentStrength: 38, maxStrength: 60, isActive: true },
    ];
    const created = await Section.insertMany(sectionsData);
    section = created[0];
    console.log(`  ✅ Created Sections A & B`);
  } else {
    console.log(`  ✅ Using existing Section: ${section.name}`);
  }

  // ── 7. Ensure we have Subjects ────────────────────────────────────────────
  let subjectList = subjects.filter(s => s.semester?.toString() === semester._id.toString());
  if (subjectList.length === 0) {
    console.log('📖 Creating sample subjects...');
    const subjectData = [
      { name: 'Operating Systems', code: 'CS501', department: department._id, course: course._id, semester: semester._id, type: 'Theory', credits: 4, hoursPerWeek: 4, isActive: true },
      { name: 'Database Management Systems', code: 'CS502', department: department._id, course: course._id, semester: semester._id, type: 'Theory', credits: 4, hoursPerWeek: 4, isActive: true },
      { name: 'Computer Networks', code: 'CS503', department: department._id, course: course._id, semester: semester._id, type: 'Theory', credits: 3, hoursPerWeek: 3, isActive: true },
      { name: 'Software Engineering', code: 'CS504', department: department._id, course: course._id, semester: semester._id, type: 'Theory', credits: 3, hoursPerWeek: 3, isActive: true },
      { name: 'Machine Learning', code: 'CS505', department: department._id, course: course._id, semester: semester._id, type: 'Theory', credits: 3, hoursPerWeek: 3, isActive: true },
    ];
    subjectList = await Subject.insertMany(subjectData);
    console.log(`  ✅ Created ${subjectList.length} subjects`);
  } else {
    console.log(`  ✅ Using ${subjectList.length} existing subjects`);
  }

  // ── 8. Create Allocations for each faculty ────────────────────────────────
  console.log('\n🔗 Creating Faculty Allocations...');
  let allocCreated = 0;
  let allocSkipped = 0;

  for (let fi = 0; fi < faculties.length; fi++) {
    const fac = faculties[fi];
    // Assign 2-3 subjects to each faculty member (rotating)
    const assigned = [subjectList[fi % subjectList.length], subjectList[(fi + 1) % subjectList.length]];
    const facSection = fi % 2 === 0 ? section : (sections[1] || section);
    
    for (const subj of assigned) {
      try {
        await FacultyAllocation.create({
          faculty: fac._id,
          subject: subj._id,
          section: facSection._id,
          semester: semester._id,
          academicYear: academicYear._id,
          department: department._id,
          isActive: true,
        });
        allocCreated++;
        console.log(`  ✅ ${fac.user?.name || fac.employeeId} → ${subj.name} (Section ${facSection.name})`);
      } catch (err) {
        if (err.code === 11000) {
          allocSkipped++;
          console.log(`  ⏭  Skipped (already exists): ${fac.user?.name} → ${subj.name}`);
        } else {
          console.error(`  ❌ Error: ${err.message}`);
        }
      }
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`  Created: ${allocCreated} allocations`);
  console.log(`  Skipped: ${allocSkipped} (duplicates)`);
  console.log(`\n👉 Refresh the Faculty "My Classes" page to see subjects!\n`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
