import Notification from '../models/Notification.js';

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
      title: { $ne: 'Attendance Marked' }
    });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
