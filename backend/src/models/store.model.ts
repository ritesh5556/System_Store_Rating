import pool from '../config/db';

export interface Store {
  id?: number;
  name: string;
  email: string;
  address: string;
  owner_id: number;
  created_at?: Date;
}

export class StoreModel {
  /**
   * Create database table if not exists
   */
  static async createTable(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS stores (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          address TEXT NOT NULL,
          owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Stores table created or already exists');
    } catch (error) {
      console.error('Error creating stores table:', error);
    }
  }

  /**
   * Create a new store
   */
  static async create(storeData: Store): Promise<Store | null> {
    try {
      const result = await pool.query(
        `INSERT INTO stores (name, email, address, owner_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, address, owner_id, created_at`,
        [storeData.name, storeData.email, storeData.address, storeData.owner_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating store:', error);
      return null;
    }
  }

  /**
   * Find store by ID
   */
  static async findById(id: number): Promise<Store | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM stores WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding store by ID:', error);
      return null;
    }
  }

  /**
   * Get all stores
   */
  static async getAll(): Promise<Store[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM stores ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all stores:', error);
      return [];
    }
  }

  /**
   * Get stores by owner ID
   */
  static async getByOwnerId(ownerId: number): Promise<Store[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM stores WHERE owner_id = $1 ORDER BY created_at DESC',
        [ownerId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting stores by owner ID:', error);
      return [];
    }
  }

  /**
   * Update store
   */
  static async update(id: number, storeData: Partial<Store>): Promise<Store | null> {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic query based on provided fields
      if (storeData.name) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(storeData.name);
        paramIndex++;
      }

      if (storeData.email) {
        updateFields.push(`email = $${paramIndex}`);
        values.push(storeData.email);
        paramIndex++;
      }

      if (storeData.address) {
        updateFields.push(`address = $${paramIndex}`);
        values.push(storeData.address);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return null;
      }

      values.push(id);
      const query = `
        UPDATE stores
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, email, address, owner_id, created_at
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating store:', error);
      return null;
    }
  }

  /**
   * Delete store by ID
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM stores WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting store:', error);
      return false;
    }
  }
} 