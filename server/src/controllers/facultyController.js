import FacultyAllocation from '../models/FacultyAllocation.js';
import Timetable from '../models/Timetable.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Subject from '../models/Subject.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Department from '../models/Department.js';
import AcademicYear from '../models/AcademicYear.js';
import { mockTimetableData } from '../utils/mockTimetableData.js';
import mongoose from 'mongoose';
import sendSMS from '../utils/sendSMS.js';

// @desc    Get faculty's assigned subjects and sections
// @route   GET /api/v1/faculty/allocations
// @access  Private/Faculty
export const getAllocations = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

    const allocations = await FacultyAllocation.find({ faculty: faculty._id })
      .populate('subject', 'name code')
      .populate({
        path: 'section',
        select: 'name currentStrength semester academicYear',
        populate: [
          { path: 'semester', select: 'name number' },
          { path: 'academicYear', select: 'year' }
        ]
      })
      .populate('department', 'name code');

    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's timetable for the faculty
// @route   GET /api/v1/faculty/timetable/today
// @access  Private/Faculty
export const getTodayTimetable = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Use target date from query, or default to today
    let targetDate = new Date();
    if (req.query.date) {
      targetDate = new Date(req.query.date);
    }

    let today = days[targetDate.getDay()];
    let queryDay = today;
    if (today === 'Saturday' || today === 'Sunday') {
      queryDay = 'Monday'; // Fallback to Monday for weekend testing
    }

    let facultyPeriods = [];
    const timetables = await Timetable.find({ 'periods.faculty': faculty._id, dayOfWeek: queryDay })
      .populate({ path: 'section', select: 'name currentStrength department', populate: { path: 'department', select: 'name code' } })
      .populate('semester', 'name number')
      .populate('academicYear', 'year')
      .populate('department', 'name code')
      .populate('periods.subject', 'name code');

    timetables.forEach(tt => {
      const myPeriods = tt.periods.filter(p => (p.faculty?._id || p.faculty)?.toString() === faculty._id.toString());
      myPeriods.forEach(p => {
        facultyPeriods.push({
          _id: p._id,
          periodNumber: p.periodNumber,
          startTime: p.startTime,
          endTime: p.endTime,
          room: p.room,
          isLab: p.isLab,
          subject: p.subject,
          section: tt.section,
          semester: tt.semester,
          academicYear: tt.academicYear,
          timetableId: tt._id,
          isAllocation: false,
        });
      });
    });

    facultyPeriods.sort((a, b) => a.periodNumber - b.periodNumber);

    // --- FALLBACK: if no timetable for today (weekend / not set up), return all allocations ---
    if (facultyPeriods.length === 0) {
      // Dev override: remove faculty:_id filter so the assigned Section A shows up even if logged into a different faculty account
      // Added .limit(5) because the user specifically requested exactly a 5-period timetable.
      const allocations = await FacultyAllocation.find({ faculty: faculty._id, isActive: true })
        .populate('subject', 'name code')
        .populate({ path: 'section', select: 'name currentStrength department', populate: { path: 'department', select: 'name code' } })
        .populate('department', 'name code')
        .limit(5);

      if (allocations.length > 0) {
        // Base alloc on the first one to get section, department
        const alloc = allocations[0];

        // Find specific row for this faculty
        const mockRow = mockTimetableData.find(row => row.facId === faculty.employeeId);

        if (mockRow) {
          const subjects = [mockRow.p1, mockRow.p2, mockRow.p3, mockRow.p4, mockRow.p5];

          facultyPeriods = Array.from({ length: 5 }).map((_, idx) => {
            const mockTimes = [
              { start: '09:00', end: '10:00', room: 'Room 100' },
              { start: '10:15', end: '11:15', room: 'Room 109' },
              { start: '11:30', end: '12:30', room: 'Room 108' },
              { start: '13:30', end: '15:10', room: 'Room 107' },
              { start: '15:25', end: '16:25', room: 'Room 106' }
            ];
            const t = mockTimes[idx];

            if (alloc.section && alloc.section.currentStrength === 0) {
              alloc.section.currentStrength = 10;
            }

            return {
              _id: new mongoose.Types.ObjectId().toString(), // Generate random id for the period
              periodNumber: idx + 1,
              startTime: t.start,
              endTime: t.end,
              room: t.room,
              isLab: subjects[idx].toLowerCase().includes('lab'),
              subject: { name: subjects[idx] }, // Wrap it as a mock Subject object
              section: alloc.section,
              department: alloc.department,
              timetableId: null,
              isAllocation: true,
            };
          });
        }
      }
    }

    // Check which of these periods have already been conducted today
    const AttendanceSession = (await import('../models/AttendanceSession.js')).default;
    const todayStart = new Date(targetDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(targetDate);
    todayEnd.setHours(23, 59, 59, 999);

    const markedSessions = await AttendanceSession.find({
      faculty: faculty._id,
      status: 'Conducted',
      date: { $gte: todayStart, $lte: todayEnd }
    });

    console.log('[DEBUG] query params:', req.query);
    console.log('[DEBUG] todayStart:', todayStart.toISOString());
    console.log('[DEBUG] todayEnd:', todayEnd.toISOString());
    console.log('[DEBUG] markedSessions count:', markedSessions.length);
    if (markedSessions.length > 0) {
      console.log('[DEBUG] markedSessions[0]:', markedSessions[0].periodNumber, markedSessions[0].date.toISOString());
    }

    const Attendance = (await import('../models/Attendance.js')).default;

    // Fetch records for the sessions that have been conducted on this specific date
    const sessionRecords = await Attendance.find({ session: { $in: markedSessions.map(s => s._id) } });

    const enrichedPeriods = facultyPeriods.map(p => {
      const sessionForPeriod = markedSessions.find(s => s.periodNumber === p.periodNumber);
      const isCompleted = !!sessionForPeriod;

      let attendancePercentage = 0;

      if (isCompleted) {
        const records = sessionRecords.filter(r => r.session.toString() === sessionForPeriod._id.toString());
        if (records.length > 0) {
          const presentCount = records.filter(r => ['Present', 'Late Entry', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(r.status)).length;
          attendancePercentage = Math.round((presentCount / records.length) * 100);
        }
      }

      return { ...p, isCompleted, attendancePercentage };
    });

    console.log('[DEBUG] enriched periods count:', enrichedPeriods.length, 'period 1 isCompleted:', enrichedPeriods.find(x => x.periodNumber === 1)?.isCompleted);



    res.status(200).json({
      success: true,
      count: enrichedPeriods.length,
      data: enrichedPeriods,
      isFallback: facultyPeriods.length === 0,
      dayOfWeek: today,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students in a specific section
// @route   GET /api/v1/faculty/students/:sectionId
// @access  Private/Faculty
export const getStudentsBySection = async (req, res, next) => {
  try {
    // Added .limit(10) because the user specifically requested to only show 10 students for testing
    const students = await Student.find({ section: req.params.sectionId })
      .populate('user', 'name email avatar')
      .populate({
        path: 'parents',
        populate: {
          path: 'user',
          select: 'name phone email'
        }
      })
      .sort('rollNumber')
      .limit(10);

    const studentsData = students.map(s => s.toObject());
    const { subjectId, date } = req.query;

    if (subjectId) {
      const AttendanceSession = (await import('../models/AttendanceSession.js')).default;
      const Attendance = (await import('../models/Attendance.js')).default;

      const allSessions = await AttendanceSession.find({
        section: req.params.sectionId,
        subject: subjectId,
        status: 'Conducted'
      });
      const sessionIds = allSessions.map(s => s._id);

      const allRecords = await Attendance.find({ session: { $in: sessionIds } });
      const statsMap = {};

      allRecords.forEach(r => {
        const sid = r.student.toString();
        if (!statsMap[sid]) {
          statsMap[sid] = { present: 0, absent: 0, od: 0, hd: 0, total: 0 };
        }
        statsMap[sid].total++;
        if (r.status === 'Present' || r.status === 'Late Entry') statsMap[sid].present++;
        else if (r.status === 'Absent') statsMap[sid].absent++;
        else if (r.status === 'On Duty' || ['Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(r.status)) statsMap[sid].od++;
        else if (r.status === 'Half Day') statsMap[sid].hd++;
        else statsMap[sid].absent++; // fallback
      });

      let targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const targetSession = allSessions.find(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === targetDate.getTime();
      });

      const todayStatusMap = {};
      if (targetSession) {
        const todayRecords = allRecords.filter(r => r.session.toString() === targetSession._id.toString());
        todayRecords.forEach(r => todayStatusMap[r.student.toString()] = r.status);
      }

      studentsData.forEach(s => {
        const sid = s._id.toString();
        const parentPhone = s.parents?.[0]?.user?.phone;

        console.log(
          `📱 Parent Phone for ${s.user?.name || 'Unknown'}:`,
          parentPhone || 'Not Available'
        );
        s.todayStatus = todayStatusMap[sid] || 'Not Marked';
        s.subjectStats = statsMap[sid] || { present: 0, absent: 0, od: 0, hd: 0, total: 0 };

        if (s.subjectStats.total > 0) {
          const presentValue = s.subjectStats.present + s.subjectStats.od + (s.subjectStats.hd * 0.5);
          s.subjectPct = Math.round((presentValue / s.subjectStats.total) * 100);
        } else {
          s.subjectPct = 0;
        }

        // ==========================================
        // LOW ATTENDANCE CHECK (For Specific Subject/Section)
        // ==========================================
        if (s.subjectPct < 80) {
          console.log(
            `⚠️ LOW ATTENDANCE (Subject): ${s.user?.name || 'Unknown'} - ${s.subjectPct}%`
          );
        }
      });
    }

    res.status(200).json({ success: true, count: studentsData.length, data: studentsData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students for faculty (e.g. from department)
// @route   GET /api/v1/faculty/students
// @access  Private/Faculty
export const getAllStudentsForFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const students = await Student.find({ department: faculty.department })
      .populate('user', 'name email avatar')
      .populate({
        path: 'parents',
        populate: {
          path: 'user',
          select: 'name phone email'
        }
      })
      .sort('rollNumber');

    // Dynamically calculate attendance for all these students to bypass stale cache
    const Attendance = (await import('../models/Attendance.js')).default;
    const allRecords = await Attendance.find({ student: { $in: students.map(s => s._id) } });

    const studentsData = students.map(s => {
      const studentObj = s.toObject();

      const parentPhone = studentObj.parents?.[0]?.user?.phone;

      console.log(
        `📱 Parent Phone for ${studentObj.user?.name || 'Unknown'}:`,
        parentPhone || 'Not Available'
      );

      const records = allRecords.filter(
        r => r.student.toString() === s._id.toString()
      );

      const total = records.length;

      const presentCount = records.filter(r =>
        [
          'Present',
          'Late Entry',
          'On Duty',
          'Sports',
          'Placement',
          'Internship',
          'Industrial Visit'
        ].includes(r.status)
      ).length;

      const halfDayCount = records.filter(
        r => r.status === 'Half Day'
      ).length;

      const present = presentCount + (halfDayCount * 0.5);

      // REAL-TIME attendance percentage
      const percentage =
        total === 0
          ? 100
          : Math.round((present / total) * 100);

      // Store the current attendance percentage
      if (!studentObj.attendanceSummary) {
        studentObj.attendanceSummary = {};
      }

      studentObj.attendanceSummary.overallPercentage = percentage;

      // ==========================================
      // LOW ATTENDANCE CHECK
      // ==========================================
      if (percentage < 80) {
        console.log(
          `⚠️ LOW ATTENDANCE: ${studentObj.user?.name || 'Unknown'} - ${percentage}%`
        );
      }

      return studentObj;
    });

    res.status(200).json({ success: true, count: studentsData.length, data: studentsData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty profile details
// @route   GET /api/v1/faculty/profile
// @access  Private/Faculty
export const getFacultyProfile = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code');

    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for faculty
// @route   GET /api/v1/faculty/attendance-history
// @access  Private/Faculty
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    // Find all Conducted sessions by this faculty
    const AttendanceSession = (await import('../models/AttendanceSession.js')).default;
    const Attendance = (await import('../models/Attendance.js')).default;

    // Build query
    const query = { faculty: faculty._id, status: 'Conducted' };

    if (req.query.date) {
      const today = new Date(req.query.date);
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: today, $lte: endOfDay };
    }

    const sessions = await AttendanceSession.find(query)
      .populate('subject', 'name')
      .populate('section', 'name')
      .sort({ date: -1 });

    const history = [];
    let totalAbsences = 0;
    let totalPresent = 0;

    for (let session of sessions) {
      const records = await Attendance.find({ session: session._id });
      const present = records.filter(r => ['Present', 'Late Entry'].includes(r.status)).length;
      const od = records.filter(r => ['On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(r.status)).length;
      const hd = records.filter(r => ['Half Day'].includes(r.status)).length;
      const absent = records.filter(r => !['Present', 'Late Entry', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit', 'Half Day'].includes(r.status)).length;
      const total = records.length;

      const presentValue = present + od + (hd * 0.5);
      const pct = total > 0 ? Math.round((presentValue / total) * 100) : 0;

      totalAbsences += absent;
      totalPresent += present + od;

      const localDate = new Date(session.date.getTime() - (session.date.getTimezoneOffset() * 60000));

      history.push({
        id: session._id,
        date: localDate.toISOString().split('T')[0],
        subject: session.subject ? session.subject.name : 'Unknown',
        section: session.section ? session.section.name : 'Unknown',
        present,
        absent,
        od,
        hd,
        total,
        pct
      });
    }

    const totalStudentsMarked = totalPresent + totalAbsences;
    const avgPresent = sessions.length > 0 ? Math.round(history.reduce((a, r) => a + r.pct, 0) / sessions.length) : 0;

    res.status(200).json({
      success: true,
      data: history,
      stats: {
        sessionsConducted: sessions.length,
        avgClassAttendance: avgPresent,
        totalStudentsMarked,
        totalAbsences
      }
    });
  } catch (error) { next(error); }
};
