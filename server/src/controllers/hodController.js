import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';

// @desc    Get faculty overview in HOD's department
// @route   GET /api/hod/faculty
// @access  Private/HOD
export const getFacultyOverview = async (req, res) => {
  try {
    const hod = await Faculty.findOne({ user: req.user._id });
    if (!hod) return res.status(404).json({ success: false, message: 'HOD profile not found' });

    const faculty = await Faculty.find({ department: hod.department })
      .populate('user', 'firstName lastName email phone profilePicture')
      .populate('subjects');

    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    console.error('Error fetching faculty overview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get department attendance analytics
// @route   GET /api/hod/analytics
// @access  Private/HOD
export const getDeptAnalytics = async (req, res) => {
  try {
    const hod = await Faculty.findOne({ user: req.user._id });
    if (!hod) return res.status(404).json({ success: false, message: 'HOD profile not found' });

    // Mock analytics for now
    const analytics = {
      overallAttendance: 82.5,
      totalStudents: 450,
      atRiskCount: 24,
      monthlyTrend: [
        { month: 'Jul', attendance: 85 },
        { month: 'Aug', attendance: 82 },
      ]
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get students with <75% attendance in dept
// @route   GET /api/hod/risk
// @access  Private/HOD
export const getAtRiskStudents = async (req, res) => {
  try {
    const hod = await Faculty.findOne({ user: req.user._id });
    if (!hod) return res.status(404).json({ success: false, message: 'HOD profile not found' });

    const students = await Student.find({ department: hod.department })
      .populate('user', 'firstName lastName')
      .limit(20);

    // Filter logic would typically involve aggregating attendance records
    // Returning dummy at-risk logic for now
    const atRisk = students.map(s => ({
      ...s.toObject(),
      attendancePercentage: Math.floor(Math.random() * (74 - 50 + 1) + 50)
    }));

    res.json({ success: true, count: atRisk.length, data: atRisk });
  } catch (error) {
    console.error('Error fetching at-risk students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get department attendance logs
// @route   GET /api/hod/attendance
// @access  Private/HOD
export const getAttendanceReview = async (req, res) => {
  try {
    // Return recent attendance sessions in the dept
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching attendance review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
