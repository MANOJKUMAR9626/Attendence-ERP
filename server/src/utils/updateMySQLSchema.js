import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const runSchemaUpdate = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'exam_hall_management',
      waitForConnections: true,
    });
    
    console.log('Connected to MySQL.');

    // 1. Add columns to students if they don't exist
    try {
      await pool.query(`ALTER TABLE students ADD COLUMN risk_level VARCHAR(20) DEFAULT 'Low'`);
      console.log('Added risk_level to students.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('risk_level already exists.');
      else throw e;
    }

    try {
      await pool.query(`ALTER TABLE students ADD COLUMN attendance_percentage INT DEFAULT 100`);
      console.log('Added attendance_percentage to students.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('attendance_percentage already exists.');
      else throw e;
    }
    
    // 2. Add columns to faculty
    try {
      await pool.query(`ALTER TABLE faculty ADD COLUMN leave_status VARCHAR(20) DEFAULT 'Active'`);
      console.log('Added leave_status to faculty.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('leave_status already exists.');
      else throw e;
    }
    
    try {
      await pool.query(`ALTER TABLE faculty ADD COLUMN workload INT DEFAULT 0`);
      console.log('Added workload to faculty.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('workload already exists.');
      else throw e;
    }

    // 3. Populate random dummy data for students
    console.log('Populating random attendance data for students...');
    await pool.query(`UPDATE students SET attendance_percentage = FLOOR(60 + (RAND() * 40))`);
    await pool.query(`UPDATE students SET risk_level = CASE WHEN attendance_percentage < 75 THEN 'Critical' WHEN attendance_percentage < 85 THEN 'High' WHEN attendance_percentage < 90 THEN 'Medium' ELSE 'Low' END`);
    
    // 4. Populate dummy data for faculty
    await pool.query(`UPDATE faculty SET workload = FLOOR(1 + (RAND() * 10))`);
    
    console.log('✅ Schema update and dummy data population complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Failed:', error);
    process.exit(1);
  }
};

runSchemaUpdate();
