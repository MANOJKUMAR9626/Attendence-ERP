import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import FacultyAllocation from '../models/FacultyAllocation.js';

dotenv.config({ path: '../../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding');

    // 1. Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});
    await AcademicYear.deleteMany({});
    await Semester.deleteMany({});
    await Section.deleteMany({});
    await Subject.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await FacultyAllocation.deleteMany({});

    console.log('Cleared existing data.');

    // 2. Create Departments
    const deptCSE = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE', establishedYear: 2000 });
    const deptECE = await Department.create({ name: 'Electronics & Communication', code: 'ECE', establishedYear: 2000 });

    // 3. Create Courses
    const courseBTech = await Course.create({ name: 'B.Tech', code: 'BT', duration: 4, department: deptCSE._id });

    // 4. Create Academic Year
    const acadYear = await AcademicYear.create({ name: '2023-2024', startDate: new Date('2023-08-01'), endDate: new Date('2024-05-31'), isActive: true });

    // 5. Create Semesters
    const sem1 = await Semester.create({ name: 'Semester 1', number: 1, academicYear: acadYear._id, course: courseBTech._id, startDate: new Date('2023-08-01'), endDate: new Date('2023-12-15') });
    const sem3 = await Semester.create({ name: 'Semester 3', number: 3, academicYear: acadYear._id, course: courseBTech._id, startDate: new Date('2023-08-01'), endDate: new Date('2023-12-15') });

    // 6. Create Sections
    const secA = await Section.create({ name: 'A', semester: sem3._id, department: deptCSE._id, course: courseBTech._id, academicYear: acadYear._id, capacity: 60 });
    const secB = await Section.create({ name: 'B', semester: sem3._id, department: deptCSE._id, course: courseBTech._id, academicYear: acadYear._id, capacity: 60 });

    // 7. Create Subjects
    const subDS = await Subject.create({ name: 'Data Structures', code: 'CS301', type: 'Theory', credits: 3, department: deptCSE._id, semester: sem3._id, course: courseBTech._id });
    const subAlgo = await Subject.create({ name: 'Algorithms', code: 'CS302', type: 'Theory', credits: 4, department: deptCSE._id, semester: sem3._id, course: courseBTech._id });
    const subML = await Subject.create({ name: 'Machine Learning', code: 'CS303', type: 'Theory', credits: 3, department: deptCSE._id, semester: sem3._id, course: courseBTech._id });
    const subDB = await Subject.create({ name: 'Database Systems', code: 'CS304', type: 'Theory', credits: 3, department: deptCSE._id, semester: sem3._id, course: courseBTech._id });

    // 8. Create Admin
    await User.create({
      name: 'System Admin', email: 'admin@smarterp.edu', password: 'password123', role: 'admin', isActive: true, isEmailVerified: true
    });

    // 9. Create Faculty Members
    const facultyData = [
      { name: 'Dr. Alan Turing', email: 'alan@smarterp.edu', desig: 'Professor', subs: [subDS._id, subAlgo._id], dept: deptCSE._id },
      { name: 'Dr. Ada Lovelace', email: 'ada@smarterp.edu', desig: 'Associate Professor', subs: [subML._id], dept: deptCSE._id },
      { name: 'Grace Hopper', email: 'grace@smarterp.edu', desig: 'Assistant Professor', subs: [subDB._id], dept: deptCSE._id },
      { name: 'Tim Berners-Lee', email: 'tim@smarterp.edu', desig: 'Lecturer', subs: [], dept: deptECE._id }
    ];

    for (let i = 0; i < facultyData.length; i++) {
      const fd = facultyData[i];
      const user = await User.create({
        name: fd.name, email: fd.email, password: 'password123', role: 'faculty', isActive: true, isEmailVerified: true, department: fd.dept
      });
      await Faculty.create({
        user: user._id, employeeId: `FAC00${i+1}`, department: fd.dept, designation: fd.desig, subjects: fd.subs, isActive: true
      });
    }

    // Ensure our testing faculty@smarterp.edu exists
    const facUser = await User.create({
      name: 'Dr. Faculty Member', email: 'faculty@smarterp.edu', password: 'password123', role: 'faculty', isActive: true, isEmailVerified: true, department: deptCSE._id
    });
    const mainFaculty = await Faculty.create({
      user: facUser._id, employeeId: 'FAC005', department: deptCSE._id, designation: 'Professor', subjects: [subDS._id], isActive: true
    });

    // 9b. Allocate subjects to Faculty Member
    await FacultyAllocation.create({
      faculty: mainFaculty._id,
      subject: subDS._id,
      section: secA._id,
      academicYear: acadYear._id,
      semester: sem3._id,
      department: deptCSE._id
    });

    // 10. Create Students
    const studentNames = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Brown', 'Diana Prince', 'Evan Wright', 'Fiona Gallagher'];
    
    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const email = `${name.split(' ')[0].toLowerCase()}@smarterp.edu`;
      const user = await User.create({
        name, email, password: 'password123', role: 'student', isActive: true, isEmailVerified: true, department: deptCSE._id
      });
      
      const pct = [88, 62, 82, 78, 67, 91, 71, 85][i];
      let risk = 'Low';
      if (pct < 65) risk = 'Critical';
      else if (pct < 75) risk = 'High';
      else if (pct < 80) risk = 'Medium';

      await Student.create({
        user: user._id,
        rollNumber: `23CSE${String(i+1).padStart(3, '0')}`,
        registerNumber: `BIT23CSE${String(i+1).padStart(3, '0')}`,
        department: deptCSE._id,
        course: courseBTech._id,
        academicYear: acadYear._id,
        currentSemester: sem3._id,
        section: i % 2 === 0 ? secA._id : secB._id,
        batch: '2023-2027',
        aiRiskLevel: risk,
        attendanceSummary: { overallPercentage: pct, totalPresent: pct, totalAbsent: 100 - pct, totalClasses: 100 },
        isActive: true
      });
    }

    // Ensure our testing student@smarterp.edu exists
    const stuUser = await User.create({
      name: 'Test Student', email: 'student@smarterp.edu', password: 'password123', role: 'student', isActive: true, isEmailVerified: true, department: deptCSE._id
    });
    await Student.create({
      user: stuUser._id,
      rollNumber: '23CSE999',
      registerNumber: 'BIT23CSE999',
      department: deptCSE._id,
      course: courseBTech._id,
      academicYear: acadYear._id,
      currentSemester: sem3._id,
      section: secA._id,
      batch: '2023-2027',
      aiRiskLevel: 'Low',
      attendanceSummary: { overallPercentage: 95, totalPresent: 95, totalAbsent: 5, totalClasses: 100 },
      isActive: true
    });

    console.log('Seeding Complete! Added Admin, Faculty, and Students.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();
