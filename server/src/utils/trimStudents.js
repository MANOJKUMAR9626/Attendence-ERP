import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({path: '../../.env'});
import User from '../models/User.js';
import Department from '../models/Department.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';
import Parent from '../models/Parent.js';

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp';
  await mongoose.connect(mongoUri);
  console.log('MongoDB Connected');
  
  const pool = mysql.createPool({host:'127.0.0.1', user:'root', password:'root', database:'exam_hall_management'});
  console.log('MySQL Connected');
  
  // Clear existing students
  const students = await Student.find({});
  const studentUserIds = students.map(s => s.user);
  await User.deleteMany({ _id: { $in: studentUserIds } });
  await Student.deleteMany({});
  console.log('Cleared all current students in MongoDB');

  // Load depts
  const [mysqlDepts] = await pool.query('SELECT * FROM departments');
  const deptIdMap = {};
  for (const d of mysqlDepts) {
    let dept = await Department.findOne({ code: d.department_code });
    if (dept) deptIdMap[d.department_id] = dept._id;
  }

  const course = await Course.findOne();
  const acadYear = await AcademicYear.findOne();

  // Setup Semesters for years 1, 2, 3, 4
  const sems = {};
  for(let y=1; y<=4; y++) {
    let num = y * 2 - 1;
    let sem = await Semester.findOne({ number: num });
    if(!sem) sem = await Semester.create({ name: 'Semester '+num, number: num, academicYear: acadYear._id, course: course._id, startDate: new Date(), endDate: new Date() });
    sems[y] = sem._id;
  }
  const section = await Section.findOne();

  // Group and pick 20 from MySQL
  const [rows] = await pool.query('SELECT * FROM students WHERE is_active=1');
  const groups = {};
  for(const s of rows) {
    let y = s.current_year || 1;
    if(y > 4) y = 4;
    let d = s.department_id;
    let key = d + '_' + y;
    if(!groups[key]) groups[key] = [];
    if(groups[key].length < 10) groups[key].push(s);
  }

  let studentOps = [];
  let userOps = [];
  let count = 0;
  
  let parentUser = await User.findOne({email: 'parent@smarterp.edu'});
  let parent = null;
  if(parentUser) {
    parent = await Parent.findOne({user: parentUser._id});
    if(!parent) parent = await Parent.create({user: parentUser._id});
  }
  
  const pIds = parent ? [parent._id] : [];
  const studentIdsForParent = [];

  for(const key in groups) {
    const studs = groups[key];
    for(const s of studs) {
      let y = s.current_year || 1;
      if(y > 4) y = 4;
      const userId = new mongoose.Types.ObjectId();
      const email = s.email || `${s.student_unique_id.toLowerCase()}_${s.student_id}@smarterp.edu`;
      userOps.push({ insertOne: { document: { _id: userId, name: s.student_name, email: email, password: 'password123', role: 'student', identifier: s.student_unique_id, phone: s.phone||'', department: deptIdMap[s.department_id], isActive: true } } });
      
      const sId = new mongoose.Types.ObjectId();
      studentIdsForParent.push(sId);
      studentOps.push({ insertOne: { document: { _id: sId, user: userId, registerNumber: s.student_unique_id, rollNumber: `${s.student_unique_id}_${s.roll_number}`, department: deptIdMap[s.department_id], course: course._id, academicYear: acadYear._id, currentSemester: sems[y], section: section._id, aiRiskLevel: s.risk_level || 'Low', attendanceSummary: { overallPercentage: s.attendance_percentage||100, totalPresent: s.attendance_percentage||100, totalAbsent: 100-(s.attendance_percentage||100), totalClasses: 100 }, isActive: true, parents: pIds } } });
      count++;
    }
  }

  if(userOps.length > 0) {
    await User.bulkWrite(userOps, {ordered:false}).catch(()=>{});
    await Student.bulkWrite(studentOps, {ordered:false}).catch(()=>{});
  }
  
  if(parent) {
    parent.students = studentIdsForParent;
    await parent.save();
  }
  
  console.log('Inserted ' + count + ' students total.');
  process.exit(0);
}

run().catch(console.error);
