import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Private/Student
export const createLeaveRequest = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const { type, startDate, endDate, reason, proofDocument, proofPublicId } = req.body;

    // Check if leave is > 3 days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const requiresHODApproval = diffDays > 3;

    const leave = await LeaveRequest.create({
      student: student._id,
      type,
      startDate,
      endDate,
      reason,
      proofDocument,
      proofPublicId,
      requiresHODApproval
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get logged in student's leave requests
// @route   GET /api/leaves/my
// @access  Private/Student
export const getMyLeaves = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const leaves = await LeaveRequest.find({ student: student._id }).sort('-createdAt');
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('Error fetching student leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get leaves for advisor's section
// @route   GET /api/leaves/advisor
// @access  Private/Advisor
export const getAdvisorLeaves = async (req, res) => {
  try {
    const advisor = await Faculty.findOne({ user: req.user._id });
    if (!advisor || !advisor.isClassAdvisor) {
      return res.status(403).json({ success: false, message: 'Not an advisor' });
    }

    // Find students in advisor's section
    const students = await Student.find({ section: advisor.advisorSection }).select('_id');
    const studentIds = students.map(s => s._id);

    const leaves = await LeaveRequest.find({ student: { $in: studentIds } })
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' }})
      .sort('-createdAt');

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('Error fetching advisor leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get leaves for HOD's department (requires HOD approval)
// @route   GET /api/leaves/hod
// @access  Private/HOD
export const getHODLeaves = async (req, res) => {
  try {
    const hod = await Faculty.findOne({ user: req.user._id });
    if (!hod || !hod.isHOD) {
      return res.status(403).json({ success: false, message: 'Not a HOD' });
    }

    // Find students in HOD's department
    const students = await Student.find({ department: hod.department }).select('_id');
    const studentIds = students.map(s => s._id);

    const leaves = await LeaveRequest.find({ 
      student: { $in: studentIds },
      requiresHODApproval: true,
      'advisorApproval.status': 'Approved'
    })
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' }})
    .sort('-createdAt');

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('Error fetching HOD leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (Advisor/HOD)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);
    
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (faculty.isClassAdvisor && !faculty.isHOD) {
      leave.advisorApproval = { status, approvedBy: faculty._id, date: Date.now(), remarks };
      if (status === 'Rejected' || !leave.requiresHODApproval) {
        leave.status = status;
      }
    } else if (faculty.isHOD) {
      leave.hodApproval = { status, approvedBy: faculty._id, date: Date.now(), remarks };
      leave.status = status; // HOD is final authority
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    await leave.save();
    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
