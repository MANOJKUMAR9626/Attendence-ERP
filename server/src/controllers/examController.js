import pool from '../config/mysqlDb.js';

// @desc    Get exam seating arrangement
// @route   GET /api/v1/exam/seating
// @access  Private (Admin)
export const getSeatingArrangement = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_seating_view');
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('MySQL Error in exam seating:', error.message);
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'Exam seating data is currently offline or unconfigured in MySQL.'
    });
  }
};
