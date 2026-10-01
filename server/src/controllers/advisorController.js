import Student from '../models/Student.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Faculty from '../models/Faculty.js';

// @desc    Get advisor's assigned class details and basic stats
// @route   GET /api/v1/advisor/class
// @access  Private/ClassAdvisor
export const getClassDetails = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    if (!faculty || !faculty.advisorSection) {
      return res.status(403).json({ success: false, message: 'Not assigned as an advisor to any section' });
    }

    const students = await Student.find({ section: faculty.advisorSection })
      .populate('user', 'name email avatar')
      .populate('section', 'name');
      
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending leave requests for the advisor's class
// @route   GET /api/v1/advisor/leaves
// @access  Private/ClassAdvisor
export const getLeaveRequests = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    if (!faculty || !faculty.advisorSection) {
      return res.status(403).json({ success: false, message: 'Not assigned as an advisor to any section' });
    }

    const students = await Student.find({ section: faculty.advisorSection }).select('_id');
    const studentIds = students.map(s => s._id);

    const leaves = await LeaveRequest.find({ status: 'Pending', student: { $in: studentIds } })
      .populate('student')
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave request status
// @route   PUT /api/v1/advisor/leaves/:id
// @access  Private/ClassAdvisor
export const updateLeaveRequest = async (req, res, next) => {
  try {
    const { status, advisorRemarks } = req.body; // 'Approved' or 'Rejected'
    
    let leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    if (advisorRemarks) leave.advisorRemarks = advisorRemarks;
    leave.approvedBy = req.user.id;
    
    await leave.save();

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};
