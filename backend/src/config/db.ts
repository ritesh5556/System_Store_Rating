import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting PostgreSQL database...');
    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL database connected successfully:', result.rows[0].now);
  } catch (error) {
    console.error('Database connection error:', error);
    console.warn('⚠️ Application will continue running, but database functionality may be limited');
    
  }
};

export default pool; 