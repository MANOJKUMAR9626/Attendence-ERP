import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pool from '../config/mysqlDb.js';

import User from '../models/User.js';
import Department from '../models/Department.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';

dotenv.config({ path: '../../.env' });

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');


    console.log('✅ MySQL Connected');

    // 1. Departments
    console.log('Migrating Departments...');
    const [mysqlDepts] = await pool.query('SELECT * FROM departments');
    const deptIdMap = {}; // MySQL ID -> MongoDB _id

    for (const d of mysqlDepts) {
      let dept = await Department.findOne({ code: d.department_code });
      if (!dept) {
        dept = await Department.create({
          name: d.department_name,
          code: d.department_code,
          establishedYear: 2000 // default
        });
      }
      deptIdMap[d.department_id] = dept._id;
    }
    console.log(`✅ Migrated ${mysqlDepts.length} departments.`);

    // Pre-requisites for Student
    let course = await Course.findOne();
    if (!course) course = await Course.create({ name: 'B.Tech', code: 'BT', duration: 4, department: Object.values(deptIdMap)[0] });
    
    let acadYear = await AcademicYear.findOne();
    if (!acadYear) acadYear = await AcademicYear.create({ name: '2023-2024', startDate: new Date('2023-08-01'), endDate: new Date('2024-05-31'), isActive: true });
    
    let semester = await Semester.findOne();
    if (!semester) semester = await Semester.create({ name: 'Semester 1', number: 1, academicYear: acadYear._id, course: course._id, startDate: new Date('2023-08-01'), endDate: new Date('2023-12-15') });
    
    let section = await Section.findOne();
    if (!section) section = await Section.create({ name: 'A', semester: semester._id, department: Object.values(deptIdMap)[0], course: course._id, academicYear: acadYear._id, capacity: 60 });

    // 2. Faculty
    console.log('Migrating Faculty...');
    const [mysqlFaculty] = await pool.query('SELECT * FROM faculty');
    let facultyCount = 0;
    
    // We will do bulk inserts for speed
    let userOps = [];
    let facultyOps = [];

    // Helper to generate ObjectId so we can link User and Faculty before saving
    for (const f of mysqlFaculty) {
      const userId = new mongoose.Types.ObjectId();
      const email = f.email || `${f.faculty_code.toLowerCase()}_${f.faculty_id}@smarterp.edu`;
      
      userOps.push({
        insertOne: {
          document: {
            _id: userId,
            name: f.faculty_name,
            email: email,
            password: 'password123', // Default password for migrated users
            role: f.designation === 'Head' ? 'hod' : 'faculty',
            identifier: f.faculty_code,
            phone: f.phone || '',
            department: deptIdMap[f.department_id] || Object.values(deptIdMap)[0],
            isActive: f.is_active === 1
          }
        }
      });

      facultyOps.push({
        insertOne: {
          document: {
            user: userId,
            employeeId: f.faculty_code,
            department: deptIdMap[f.department_id] || Object.values(deptIdMap)[0],
            designation: f.designation,
            isActive: f.is_active === 1
          }
        }
      });
      facultyCount++;
    }

    if (userOps.length > 0) {
      await User.bulkWrite(userOps, { ordered: false }).catch(e => console.log('Some duplicate users skipped'));
      await Faculty.bulkWrite(facultyOps, { ordered: false }).catch(e => console.log('Some duplicate faculty skipped'));
    }
    console.log(`✅ Migrated ${facultyCount} faculty.`);

    // 3. Students
    console.log('Migrating Students (this might take a few seconds)...');
    const [mysqlStudents] = await pool.query('SELECT * FROM students');
    let studentCount = 0;
    
    let studentUserOps = [];
    let studentOps = [];

    for (const s of mysqlStudents) {
      const userId = new mongoose.Types.ObjectId();
      const email = s.email || `${s.student_unique_id.toLowerCase()}_${s.student_id}@smarterp.edu`;
      
      studentUserOps.push({
        insertOne: {
          document: {
            _id: userId,
            name: s.student_name,
            email: email,
            password: 'password123',
            role: 'student',
            identifier: s.student_unique_id,
            phone: s.phone || '',
            department: deptIdMap[s.department_id] || Object.values(deptIdMap)[0],
            isActive: s.is_active === 1
          }
        }
      });

      studentOps.push({
        insertOne: {
          document: {
            user: userId,
            registerNumber: s.student_unique_id,
            rollNumber: `${s.student_unique_id}_${s.roll_number}`,
            department: deptIdMap[s.department_id] || Object.values(deptIdMap)[0],
            course: course._id,
            academicYear: acadYear._id,
            currentSemester: semester._id,
            section: section._id, // Assign to a default section for now
            aiRiskLevel: s.risk_level || 'Low',
            attendanceSummary: {
               overallPercentage: s.attendance_percentage || 100,
               totalPresent: s.attendance_percentage || 100,
               totalAbsent: 100 - (s.attendance_percentage || 100),
               totalClasses: 100
            },
            isActive: s.is_active === 1
          }
        }
      });
      studentCount++;

      // Execute in batches of 1000 to avoid memory overflow
      if (studentUserOps.length >= 1000) {
        await User.bulkWrite(studentUserOps, { ordered: false }).catch(e => console.error(e.message));
        await Student.bulkWrite(studentOps, { ordered: false }).catch(e => console.error(e.message));
        studentUserOps = [];
        studentOps = [];
        console.log(`... inserted ${studentCount} students`);
      }
    }

    if (studentUserOps.length > 0) {
      await User.bulkWrite(studentUserOps, { ordered: false }).catch(e => console.error(e.message));
      await Student.bulkWrite(studentOps, { ordered: false }).catch(e => console.error(e.message));
    }

    console.log(`✅ Migrated ${studentCount} students.`);
    console.log('🎉 Migration completely successfully!');
    
    pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration Failed:', error);
    if (pool) pool.end();
    process.exit(1);
  }
};

migrate();
