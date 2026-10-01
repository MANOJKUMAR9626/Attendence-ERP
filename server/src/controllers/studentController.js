import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Timetable from '../models/Timetable.js';
import Subject from '../models/Subject.js';
import Faculty from '../models/Faculty.js';
import FacultyAllocation from '../models/FacultyAllocation.js';
import mongoose from 'mongoose';
import { mockTimetableData } from '../utils/mockTimetableData.js';
import { predictAttendance } from '../services/aiPredictionService.js';

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (student)
export const getDashboard = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .populate('section', 'name')
      .populate('department', 'name')
      .populate('course', 'name');

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Fetch all attendance records for this student
    const records = await Attendance.find({ student: studentProfile._id })
      .sort({ createdAt: 1 })
      .populate({
        path: 'session',
        select: 'date subject periodNumber',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      });

    const totalClasses = records.length;
    const presentClasses = records.filter(r => r.status === 'Present' || r.status === 'Late Entry').length;
    const absentClasses = records.filter(r => r.status === 'Absent').length;
    const currentPercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    // Calculate Subject-wise attendance
    const subjectMap = {};
    records.forEach(record => {
      if (record.session && record.session.subject) {
        const subjId = record.session.subject._id.toString();
        const subjName = record.session.subject.name;
        
        if (!subjectMap[subjId]) {
          subjectMap[subjId] = {
            subjectId: subjId,
            subjectName: subjName,
            totalClasses: 0,
            presentClasses: 0
          };
        }
        
        subjectMap[subjId].totalClasses++;
        if (record.status === 'Present' || record.status === 'Late Entry') {
          subjectMap[subjId].presentClasses++;
        }
      }
    });

    const subjectAttendance = Object.values(subjectMap).map(subj => ({
      ...subj,
      percentage: subj.totalClasses > 0 ? Math.round((subj.presentClasses / subj.totalClasses) * 100) : 0
    }));

    // Run AI Prediction
    const prediction = predictAttendance(records);

    // Get recent records for the log (last 10)
    const recentRecords = records.slice(-10).reverse();

    res.status(200).json({
      success: true,
      data: {
        student: studentProfile,
        stats: {
          totalClasses,
          presentClasses,
          absentClasses,
          currentPercentage
        },
        subjectAttendance,
        prediction,
        recentRecords
      }
    });
  } catch (error) {
    console.error('Student Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get today's timetable for the student
// @route   GET /api/v1/student/timetable/today
// @access  Private (student)
export const getTodayTimetable = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate('department');
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let targetDate = new Date();
    if (req.query.date) {
      targetDate = new Date(req.query.date);
    }
    let today = days[targetDate.getDay()];
    if (today === 'Saturday' || today === 'Sunday') {
      today = 'Monday'; // Fallback to Monday for weekend testing
    }

    const timetable = await Timetable.findOne({ section: student.section, dayOfWeek: today })
      .populate({
        path: 'periods.subject',
        select: 'name code'
      })
      .populate({
        path: 'periods.faculty',
        populate: { path: 'user', select: 'name email' }
      });

    if (!timetable || timetable.periods.length === 0) {
      // Return a fallback 5-period schedule based on FacultyAllocations for the student's section
      const allocations = await FacultyAllocation.find({ section: student.section, isActive: true })
        .populate('subject', 'name code')
        .populate({ path: 'faculty', populate: { path: 'user', select: 'name email' } })
        .limit(5);

      let defaultPeriods = [];
      if (allocations.length > 0) {
        defaultPeriods = Array.from({ length: 5 }).map((_, idx) => {
          const mockTimes = [
            { start: '09:00 AM', end: '10:00 AM', room: 'Room 100' },
            { start: '10:15 AM', end: '11:15 AM', room: 'Room 109' },
            { start: '11:30 AM', end: '12:30 PM', room: 'Room 108' },
            { start: '01:30 PM', end: '03:10 PM', room: 'Room 107' },
            { start: '03:25 PM', end: '04:25 PM', room: 'Room 106' }
          ];
          const t = mockTimes[idx];
          const alloc = allocations[idx % allocations.length]; // Cycle through available allocations
          return {
            _id: new mongoose.Types.ObjectId().toString(),
            periodNumber: idx + 1,
            startTime: t.start,
            endTime: t.end,
            subject: { name: alloc.subject?.name || 'Unknown Subject' },
            faculty: { user: { name: alloc.faculty?.user?.name || 'Unknown Faculty' } },
            room: t.room,
            isLab: alloc.subject?.name?.toLowerCase().includes('lab') || false
          };
        });
      }
      return res.status(200).json({ success: true, count: defaultPeriods.length, data: defaultPeriods });
    }

    const periods = timetable.periods.map(p => ({
      _id: p._id,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
      room: p.room,
      isLab: p.isLab,
      subject: p.subject,
      faculty: p.faculty,
      timetableId: timetable._id
    })).sort((a, b) => a.periodNumber - b.periodNumber);

    res.status(200).json({ success: true, count: periods.length, data: periods });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile
// @route   GET /api/v1/student/profile
// @access  Private (student)
export const getStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar gender')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('currentSemester', 'name')
      .populate('section', 'name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed attendance history grouped by date
// @route   GET /api/v1/student/attendance-history
// @access  Private (student)
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Get current semester (August 1st to December 31st)
    const year = new Date().getFullYear();
    const semesterStart = new Date(year, 7, 1); // August 1st
    const semesterEnd = new Date(year, 11, 31, 23, 59, 59); // Dec 31st

    const records = await Attendance.find({ 
      student: studentProfile._id,
      date: { $gte: semesterStart, $lte: semesterEnd }
    }).populate({
      path: 'session',
      select: 'date subject periodNumber faculty',
      populate: [
        { path: 'subject', select: 'name code' },
        { path: 'faculty', select: 'user', populate: { path: 'user', select: 'name' } }
      ]
    }).sort({ date: -1 });

    const groupedByDate = {};
    records.forEach(record => {
      // Correctly get YYYY-MM-DD
      const d = new Date(record.date);
      // Adjust for timezone to avoid off-by-one errors
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const dateString = d.toISOString().split('T')[0];
      
      if (!groupedByDate[dateString]) {
        groupedByDate[dateString] = [];
      }
      
      // Determine time from period number
      const mockTimes = {
        1: '09:00 AM - 10:00 AM',
        2: '10:15 AM - 11:15 AM',
        3: '11:30 AM - 12:30 PM',
        4: '01:30 PM - 03:10 PM',
        5: '03:25 PM - 04:25 PM'
      };
      
      const periodNo = record.session?.periodNumber;
      const timeStr = mockTimes[periodNo] || 'Unknown Time';
      const facultyName = record.session?.faculty?.user?.name || 'Unknown Faculty';

      groupedByDate[dateString].push({
        id: record._id,
        status: record.status,
        period: `Period ${periodNo || 'N/A'}`,
        subject: record.session?.subject?.name || record.session?.subject?.code || 'Unknown Subject',
        faculty: facultyName,
        time: timeStr
      });
    });

    res.status(200).json({
      success: true,
      data: groupedByDate,
      semesterStart,
      semesterEnd
    });
  } catch (error) {
    console.error('Attendance History Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};