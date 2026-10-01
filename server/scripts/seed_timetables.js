import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure dotenv to access DB URI
dotenv.config({ path: '../.env' });

// Load models
import Department from '../src/models/Department.js';
import Course from '../src/models/Course.js';
import AcademicYear from '../src/models/AcademicYear.js';
import Semester from '../src/models/Semester.js';
import Section from '../src/models/Section.js';
import Student from '../src/models/Student.js';
import User from '../src/models/User.js';
import Subject from '../src/models/Subject.js';
import Faculty from '../src/models/Faculty.js';
import Timetable from '../src/models/Timetable.js';

const facultyRawText = `FAC001 Biomedical Engineering 1st Year Engineering Biology Biomedical Instrumentation Medical Imaging Biomaterials
FAC002 Biomedical Engineering 2nd Year Biomedical Instrumentation Medical Imaging Biomaterials Engineering Biology
FAC003 Biomedical Engineering 3rd Year Medical Imaging Biomaterials Engineering Biology Biomedical Instrumentation
FAC004 Biomedical Engineering 4th Year Biomaterials Engineering Biology Biomedical Instrumentation Medical Imaging
FAC005 Biomedical Engineering All Years / Elective Engineering Biology Biomedical Instrumentation Medical Imaging Biomaterials
FAC006 Civil Engineering 1st Year Engineering Mechanics Surveying Structural Analysis Transportation Engineering
FAC007 Civil Engineering 2nd Year Surveying Structural Analysis Transportation Engineering Engineering Mechanics
FAC008 Civil Engineering 3rd Year Structural Analysis Transportation Engineering Engineering Mechanics Surveying
FAC009 Civil Engineering 4th Year Transportation Engineering Engineering Mechanics Surveying Structural Analysis
FAC010 Civil Engineering All Years / Elective Engineering Mechanics Surveying Structural Analysis Transportation Engineering
FAC011 Computer Science and Design 1st Year Programming in C DataStructures UI/UX Design Computer Graphics
FAC012 Computer Science and Design 2nd Year Data Structures UI/UX Design Computer Graphics Programming in C
FAC013 Computer Science and Design 3rd Year UI/UX Design Computer Graphics Programming in C DataStructures
FAC014 Computer Science and Design 4th Year Computer Graphics Programming in C DataStructures UI/UX Design
FAC015 Computer Science and Design All Years / Elective Programming in C DataStructures UI/UX Design Computer Graphics
FAC016 Computer Science and Engineering 1st Year Programming in Java Data Structures DBMS Computer Networks
FAC017 Computer Science and Engineering 2nd Year Data Structures DBMS Computer Networks Programming in Java
FAC018 Computer Science and Engineering 3rd Year DBMS Computer Networks Programming in Java Data Structures
FAC019 Computer Science and Engineering 4th Year Computer Networks Programming in Java Data Structures DBMS
FAC020 Computer Science and Engineering All Years / Elective Programming in Java Data Structures DBMS Computer Networks
FAC021 Electrical and Electronics Engineering 1st Year Circuit Theory Electrical Machines Power Systems Control Systems
FAC022 Electrical and Electronics Engineering 2nd Year Electrical Machines Power Systems Control Systems Circuit Theory
FAC023 Electrical and Electronics Engineering 3rd Year Power Systems Control Systems Circuit Theory Electrical Machines
FAC024 Electrical and Electronics Engineering 4th Year Control Systems Circuit Theory Electrical Machines Power Systems
FAC025 Electrical and Electronics Engineering All Years / Elective Circuit Theory Electrical Machines Power Systems Control Systems
FAC026 Electronics and Communication Engineering 1st Year Electronic Devices Digital Electronics Signals and Systems Communication Systems
FAC027 Electronics and Communication Engineering 2nd Year Digital Electronics Signals and Systems Communication Systems Electronic Devices
FAC028 Electronics and Communication Engineering 3rd Year Signals and Systems Communication Systems Electronic Devices Digital Electronics
FAC029 Electronics and Communication Engineering 4th Year Communication Systems Electronic Devices Digital Electronics Signals and Systems
FAC030 Electronics and Communication Engineering All Years / Elective Electronic Devices Digital Electronics Signals and Systems Communication Systems
FAC031 Electronics and Instrumentation Engineering 1st Year Basic Electronics Sensors and Transducers Process Control Industrial Instrumentation
FAC032 Electronics and Instrumentation Engineering 2nd Year Sensors and Transducers Process Control Industrial Instrumentation Basic Electronics
FAC033 Electronics and Instrumentation Engineering 3rd Year Process Control Industrial Instrumentation Basic Electronics Sensors and Transducers
FAC034 Electronics and Instrumentation Engineering 4th Year Industrial Instrumentation Basic Electronics Sensors and Transducers Process Control
FAC035 Electronics and Instrumentation Engineering All Years / Elective Basic Electronics Sensors and Transducers Process Control Industrial Instrumentation
FAC036 Information Science and Engineering 1st Year Programming Fundamentals Data Structures DBMS Machine Learning
FAC037 Information Science and Engineering 2nd Year Data Structures DBMS Machine Learning Programming Fundamentals
FAC038 Information Science and Engineering 3rd Year DBMS Machine Learning Programming Fundamentals Data Structures
FAC039 Information Science and Engineering 4th Year Machine Learning Programming Fundamentals Data Structures DBMS
FAC040 Information Science and Engineering All Years / Elective Programming Fundamentals Data Structures DBMS Machine Learning
FAC041 Mechanical Engineering 1st Year Engineering Mechanics Thermodynamics Manufacturing Technology Machine Design
FAC042 Mechanical Engineering 2nd Year Thermodynamics Manufacturing Technology Machine Design Enineering Mechanics
FAC043 Mechanical Engineering 3rd Year Manufacturing Technology Machine Design Enineering Mechanics Thermodynamics
FAC044 Mechanical Engineering 4th Year Machine Design Enineering Mechanics Thermodynamics Manufacturing Technology
FAC045 Mechanical Engineering All Years / Elective Engineering Mechanics Thermodynamics Manufacturing Technology Machine Design
FAC046 Mechatronics Engineering 1st Year Engineering Mechanics Sensors and Actuators PLC Programming Robotics
FAC047 Mechatronics Engineering 2nd Year Sensors and Actuators PLC Programming Robotics Engineering Mechanics
FAC048 Mechatronics Engineering 3rd Year PLC Programming Robotics Engineering Mechanics Sensors and Actuators
FAC049 Mechatronics Engineering 4th Year Robotics Engineering Mechanics Sensors and Actuators PLC Programming
FAC050 Mechatronics Engineering All Years / Elective Engineering Mechanics Sensors and Actuators PLC Programming Robotics
FAC051 Agricultural Engineering 1st Year Soil Science Farm Machinery Irrigation Engineering Precision Agriculture
FAC052 Agricultural Engineering 2nd Year Farm Machinery Irrigation Engineering Precision Agriculture Soil Science
FAC053 Agricultural Engineering 3rd Year Irrigation Engineering Precision Agriculture Soil Science Farm Machinery
FAC054 Agricultural Engineering 4th Year Precision Agriculture Soil Science Farm Machinery Irrigation Engineering
FAC055 Agricultural Engineering All Years / Elective Soil Science Farm Machinery Irrigation Engineering Precision Agriculture
FAC056 Artificial Intelligence and Data Science 1st Year Python Programming Data Structures Data Mining Machine Learning
FAC057 Artificial Intelligence and Data Science 2nd Year Data Structures Data Mining Machine Learning Python Programming
FAC058 Artificial Intelligence and Data Science 3rd Year Data Mining Machine Learning Python Programming Data Structures
FAC059 Artificial Intelligence and Data Science 4th Year Machine Learning Python Programming Data Structures Data Mining
FAC060 Artificial Intelligence and Data Science All Years / Elective Python Programming Data Structures Data Mining Machine Learning
FAC061 Artificial Intelligence and Machine Learning 1st Year Python Programming Algorithms Machine Learning Neural Networks
FAC062 Artificial Intelligence and Machine Learning 2nd Year Algorithms Machine Learning Neural Networks Python Programming
FAC063 Artificial Intelligence and Machine Learning 3rd Year Machine Learning Neural Networks Python Programming Algorithms
FAC064 Artificial Intelligence and Machine Learning 4th Year Neural Networks Python Programming Algorithms Machine Learning
FAC065 Artificial Intelligence and Machine Learning All Years / Elective Python Programming Algorithms Machine Learning Neural Networks
FAC066 Biotechnology 1st Year Cell Biology Biochemistry Microbiology Genetic Engineering
FAC067 Biotechnology 2nd Year Biochemistry Microbiology Genetic Engineering Cell Biology
FAC068 Biotechnology 3rd Year Microbiology Genetic Engineering Cell Biology Biochemistry
FAC069 Biotechnology 4th Year Genetic Engineering Cell Biology Biochemistry Microbiology
FAC070 Biotechnology All Years / Elective Cell Biology Biochemistry Microbiology Genetic Engineering
FAC071 Computer Science and Business Systems 1st Year Programming Fundamentals Data Structures Business Analytics DBMS
FAC072 Computer Science and Business Systems 2nd Year Data Structures Business Analytics DBMS Programming Fundamentals
FAC073 Computer Science and Business Systems 3rd Year Business Analytics DBMS Programming Fundamentals Data Structures
FAC074 Computer Science and Business Systems 4th Year DBMS Programming Fundamentals Data Structures Business Analytics
FAC075 Computer Science and Business Systems All Years / Elective Programming Fundamentals Data Structures Business Analytics DBMS
FAC076 Computer Technology 1st Year Programming in C Java Programming DBMS Computer Networks
FAC077 Computer Technology 2nd Year Java Programming DBMS Computer Networks Programming in C
FAC078 Computer Technology 3rd Year DBMS Computer Networks Programming in C Java Programming
FAC079 Computer Technology 4th Year Computer Networks Programming in C Java Programming DBMS
FAC080 Computer Technology All Years / Elective Programming in C Java Programming DBMS Computer Networks
FAC081 Food Technology 1st Year Food Chemistry Food Microbiology Food Processing Food Packaging
FAC082 Food Technology 2nd Year Food Microbiology Food Processing Food Packaging Food Chemistry
FAC083 Food Technology 3rd Year Food Processing Food Packaging Food Chemistry Food Microbiology
FAC084 Food Technology 4th Year Food Packaging Food Chemistry Food Microbiology Food Processing
FAC085 Food Technology All Years / Elective Food Chemistry Food Microbiology Food Processing Food Packaging
FAC086 Information Technology 1st Year Programming Fundamentals Data Structures Data Mining Cloud Computing
FAC087 Information Technology 2nd Year Data Structures Data Mining Cloud Computing Programming Fundamentals
FAC088 Information Technology 3rd Year Data Mining Cloud Computing Programming Fundamentals Data Structures
FAC089 Information Technology 4th Year Cloud Computing Programming Fundamentals Data Structures Data Mining
FAC090 Information Technology All Years / Elective Programming Fundamentals Data Structures Data Mining Cloud Computing
FAC091 Fashion Technology 1st Year Fashion Illustration Pattern Making Garment Construction Textile Science
FAC092 Fashion Technology 2nd Year Pattern Making Garment Construction Textile Science Fashion Illustration
FAC093 Fashion Technology 3rd Year Garment Construction Textile Science Fashion Illustration Pattern Making
FAC094 Fashion Technology 4th Year Textile Science Fashion Illustration Pattern Making Garment Construction
FAC095 Fashion Technology All Years / Elective Fashion Illustration Pattern Making Garment Construction Textile Science
FAC096 Textile Technology 1st Year Textile Fibers Yarn Manufacturing Fabric Manufacturing Textile Chemistry
FAC097 Textile Technology 2nd Year Yarn Manufacturing Fabric Manufacturing Textile Chemistry Texile Fibers
FAC098 Textile Technology 3rd Year Fabric Manufacturing Textile Chemistry Texile Fibers Yarn Manufacturing
FAC099 Textile Technology 4th Year Textile Chemistry Texile Fibers Yarn Manufacturing Fabric Manufacturing
FAC100 Textile Technology All Years / Elective Textile Fibers Yarn Manufacturing Fabric Manufacturing Textile Chemistry`;

function parseFacultyData() {
  const lines = facultyRawText.trim().split('\n');
  const faculties = [];

  for (let line of lines) {
    const parts = line.split(' ');
    const facultyId = parts[0]; 

    let yearIndex = parts.findIndex(p => p.includes('Year') || p.includes('Elective'));
    if (parts[yearIndex] === 'Years') yearIndex = parts.findIndex(p => p === 'Elective');
    
    let deptName = parts.slice(1, yearIndex).filter(p => p !== '/' && p !== 'All' && p !== 'Years').join(' ').trim();
    
    let yearStr = parts.slice(yearIndex-1, yearIndex+1).join(' ');
    if (yearStr.includes('All Years')) yearStr = 'Elective';
    if (parts[yearIndex] === 'Elective') yearStr = 'Elective';
    if (parts[yearIndex].includes('Year')) yearStr = parts[yearIndex - 1] + ' Year';

    let restStrIndex = yearIndex + 1;
    if (parts[yearIndex] === 'Elective') restStrIndex = yearIndex + 1;
    
    const restStr = parts.slice(restStrIndex).join(' ');
    const words = restStr.trim().split(/\s+/);
    const chunkSize = Math.ceil(words.length / 4);
    
    faculties.push({
      facultyId,
      deptName,
      yearStr,
      periods: [
        words.slice(0, chunkSize).join(' '),
        words.slice(chunkSize, chunkSize * 2).join(' '),
        words.slice(chunkSize * 2, chunkSize * 3).join(' '),
        words.slice(chunkSize * 3).join(' ')
      ]
    });
  }

  return faculties;
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
    console.log('Connected to MongoDB.');

    // 1. Initialize Academic Year
    let acYear = await AcademicYear.findOne({ name: '2024-2025' });
    if (!acYear) {
      acYear = await AcademicYear.create({
        name: '2024-2025',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-05-31'),
        isCurrent: true
      });
      console.log('Created Academic Year 2024-2025');
    }

    const faculties = parseFacultyData();
    console.log(`Parsed ${faculties.length} faculty entries.`);

    let studentIdCounter = 1;

    for (const fac of faculties) {
      // 2. Department
      function getDeptCode(name) {
        if(name.includes('Biomedical')) return 'BME';
        if(name.includes('Civil')) return 'CE';
        if(name.includes('Computer Science and Design')) return 'CSD';
        if(name.includes('Computer Science and Engineering')) return 'CSE';
        if(name.includes('Electrical')) return 'EEE';
        if(name.includes('Electronics and Communication')) return 'ECE';
        if(name.includes('Electronics and Instrumentation')) return 'EIE';
        if(name.includes('Information Science')) return 'ISE';
        if(name.includes('Mechatronics')) return 'MTE'; 
        if(name.includes('Mechanical')) return 'ME';
        if(name.includes('Agricultural')) return 'AG';
        if(name.includes('Artificial Intelligence and Data')) return 'AIDS';
        if(name.includes('Artificial Intelligence and Machine')) return 'AIML';
        if(name.includes('Biotechnology')) return 'BT';
        if(name.includes('Computer Science and Business')) return 'CSBS';
        if(name.includes('Computer Technology')) return 'CT';
        if(name.includes('Food Technology')) return 'FT';
        if(name.includes('Information Technology')) return 'IT';
        if(name.includes('Fashion Technology')) return 'FST';
        if(name.includes('Textile Technology')) return 'TT';
        return name.split(' ').map(w => w[0]).join('').toUpperCase();
      }
      let deptCode = getDeptCode(fac.deptName);
      let department = await Department.findOneAndUpdate(
        { code: deptCode },
        { code: deptCode, name: fac.deptName },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 3. Course
      let course = await Course.findOneAndUpdate(
        { code: `BTECH-${deptCode}` },
        { name: `B.Tech ${fac.deptName}`, department: department._id, code: `BTECH-${deptCode}` },
        { upsert: true, new: true }
      );

      // 4. Semester
      let semNum = 1;
      if (fac.yearStr === '2nd Year') semNum = 3;
      if (fac.yearStr === '3rd Year') semNum = 5;
      if (fac.yearStr === '4th Year') semNum = 7;
      if (fac.yearStr === 'Elective') semNum = 8;
      
      let semester = await Semester.findOneAndUpdate(
        { course: course._id, number: semNum },
        { name: `Semester ${semNum}`, number: semNum, course: course._id, academicYear: acYear._id, isCurrent: true },
        { upsert: true, new: true }
      );

      // 5. Section
      let section = await Section.findOneAndUpdate(
        { course: course._id, semester: semester._id, name: 'A' },
        { name: 'A', department: department._id, course: course._id, semester: semester._id, academicYear: acYear._id, maxStrength: 60 },
        { upsert: true, new: true }
      );

      // 6. Faculty User & Profile
      let facUserEmail = `${fac.facultyId.toLowerCase()}@erp.com`;
      let facUser = await User.findOneAndUpdate(
        { email: facUserEmail },
        { name: `Faculty ${fac.facultyId}`, email: facUserEmail, password: 'password123', role: 'faculty', department: department._id },
        { upsert: true, new: true }
      );
      
      let facultyDoc = await Faculty.findOneAndUpdate(
        { employeeId: fac.facultyId },
        { user: facUser._id, employeeId: fac.facultyId, department: department._id },
        { upsert: true, new: true }
      );

      // 7. Subjects for periods
      const subjectDocs = [];
      for (let i=0; i<4; i++) {
        let subName = fac.periods[i];
        if (!subName) subName = 'Free Period';
        let subCode = `${deptCode}-${semNum}0${i+1}`;
        let sub = await Subject.findOneAndUpdate(
          { name: subName, department: department._id },
          { name: subName, code: subCode, department: department._id, course: course._id, semester: semester._id },
          { upsert: true, new: true }
        );
        subjectDocs.push(sub);
      }

      // 8. Timetable
      // Create periods array
      const periods = [];
      let startTime = 9; // 09:00
      for (let i=0; i<4; i++) {
        periods.push({
          periodNumber: i+1,
          startTime: `${String(startTime).padStart(2, '0')}:00`,
          endTime: `${String(startTime+1).padStart(2, '0')}:00`,
          subject: subjectDocs[i]._id,
          faculty: facultyDoc._id,
          room: `Room-${deptCode}-${semNum}`,
          isLab: false
        });
        startTime++;
      }

      await Timetable.findOneAndUpdate(
        { section: section._id, dayOfWeek: 'Monday' },
        { 
          section: section._id, semester: semester._id, academicYear: acYear._id, department: department._id,
          dayOfWeek: 'Monday', periods, isActive: true
        },
        { upsert: true, new: true }
      );

      // 9. Create 8 Students for this faculty
      for (let i = 0; i < 8; i++) {
        const studentIdStr = `STU${String(studentIdCounter).padStart(3, '0')}`;
        let stuEmail = `${studentIdStr.toLowerCase()}@erp.com`;
        
        let stuUser = await User.findOneAndUpdate(
          { email: stuEmail },
          { name: `Student ${studentIdStr}`, email: stuEmail, password: 'password123', role: 'student', department: department._id },
          { upsert: true, new: true }
        );

        await Student.findOneAndUpdate(
          { rollNumber: studentIdStr },
          { 
            user: stuUser._id, rollNumber: studentIdStr, registerNumber: studentIdStr, department: department._id, course: course._id, 
            academicYear: acYear._id, currentSemester: semester._id, section: section._id 
          },
          { upsert: true, new: true }
        );
        
        studentIdCounter++;
      }
    }
    
    console.log(`Successfully completed REAL database seeding!`);
    console.log(`Created 100 Faculties, ~900 Users, 800 Students, and 100 Timetables.`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
