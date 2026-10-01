import pool from '../config/mysqlDb.js';

// @desc    Get exam seating arrangement
// @route   GET /api/v1/exam/seating
// @access  Private (Admin)
export const getSeatingArrangement = async (req, res, next) => {
  try {
    // We will query the student_seating_view which we created earlier
    const [rows] = await pool.query('SELECT * FROM student_seating_view');
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('MySQL Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam seating' });
  }
};
