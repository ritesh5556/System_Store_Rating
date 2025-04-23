import pool from '../config/db';
import bcrypt from 'bcrypt';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  address: string;
  role: 'admin' | 'user' | 'store_owner';
  created_at?: Date;
}

export class UserModel {
  /**
   * Create database table if not exists
   */
  static async createTable(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          address TEXT NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created or already exists');
    } catch (error) {
      console.error('Error creating users table:', error);
    }
  }

  /**
   * Create a new user
   */
  static async create(userData: User): Promise<User | null> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const result = await pool.query(
        `INSERT INTO users (name, email, password, address, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at`,
        [userData.name, userData.email, hashedPassword, userData.address, userData.role]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find a user by ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Update a user
   */
  static async update(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic query based on provided fields
      if (userData.name) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(userData.name);
        paramIndex++;
      }

      if (userData.email) {
        updateFields.push(`email = $${paramIndex}`);
        values.push(userData.email);
        paramIndex++;
      }

      if (userData.password) {
        // Hash the password before updating
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updateFields.push(`password = $${paramIndex}`);
        values.push(hashedPassword);
        paramIndex++;
      }

      if (userData.address) {
        updateFields.push(`address = $${paramIndex}`);
        values.push(userData.address);
        paramIndex++;
      }

      if (userData.role) {
        updateFields.push(`role = $${paramIndex}`);
        values.push(userData.role);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return null;
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING id, name, email, address, role, created_at
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Get all users
   */
  static async getAll(): Promise<User[]> {
    try {
      const result = await pool.query(
        'SELECT id, name, email, address, role, created_at FROM users'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Delete a user
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Compare password with hashed password
   */
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
} 