import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Parent from '../models/Parent.js';
import { predictAttendance } from '../services/aiPredictionService.js';

// @desc    Get parent profile
// @route   GET /api/parent/profile
// @access  Private (parent)
export const getProfile = async (req, res) => {
  try {
    const parentDoc = await Parent.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate({
        path: 'students',
        populate: [
          { path: 'user', select: 'name email phone gender' },
          { path: 'course', select: 'name' },
          { path: 'department', select: 'name code' }
        ]
      });

    if (!parentDoc) {
      return res.status(404).json({ success: false, message: 'Parent profile not found' });
    }

    res.status(200).json({ success: true, data: parentDoc });
  } catch (error) {
    console.error('Parent Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get parent dashboard: ward's attendance and AI prediction
// @route   GET /api/parent/dashboard
// @access  Private (parent)
export const getWardDashboard = async (req, res) => {
  try {
    // Find the Parent document for the logged in user
    const parentDoc = await Parent.findOne({ user: req.user._id });
    
    let wards = [];
    if (parentDoc) {
      wards = await Student.find({ parents: parentDoc._id })
        .populate('user', 'name email')
        .populate('section', 'name')
        .populate('department', 'name');
    }

    if (!wards || wards.length === 0) {
      // Return empty but successful response
      return res.status(200).json({ success: true, data: { wards: [] } });
    }

    const wardData = await Promise.all(wards.map(async (ward) => {
      const records = await Attendance.find({ student: ward._id }).sort({ createdAt: 1 });
      const totalClasses = records.length;
      const presentClasses = records.filter(r => r.status === 'Present' || r.status === 'Late Entry').length;
      const currentPercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      const prediction = predictAttendance(records);

      return {
        ward,
        stats: { totalClasses, presentClasses, currentPercentage },
        prediction
      };
    }));

    res.status(200).json({ success: true, data: { wards: wardData } });
  } catch (error) {
    console.error('Parent Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
