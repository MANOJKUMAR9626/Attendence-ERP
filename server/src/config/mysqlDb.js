import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'exam_hall_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected: ${connection.config.host}`);
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

export default pool;
