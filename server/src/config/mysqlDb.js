import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Build pool config supporting standard individual variables or cloud DATABASE_URL / MYSQL_URL
const getPoolConfig = () => {
  const uri = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (uri) {
    return {
      uri,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    };
  }

  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'exam_hall_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
};

const pool = mysql.createPool(getPoolConfig());

export let isMySQLConnected = false;

export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected: ${connection.config.host}`);
    connection.release();
    isMySQLConnected = true;
  } catch (error) {
    isMySQLConnected = false;
    console.warn(`⚠️ MySQL Notice: ${error.message}`);
    console.warn('ℹ️ Running in MongoDB primary mode. (Optional: Configure MYSQL_HOST or MYSQL_URL for Exam Seating features).');
  }
};

export default pool;
