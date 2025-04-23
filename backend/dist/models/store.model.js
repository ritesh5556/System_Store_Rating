"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class StoreModel {
    /**
     * Create database table if not exists
     */
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.default.query(`
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
            }
            catch (error) {
                console.error('Error creating stores table:', error);
            }
        });
    }
    /**
     * Create a new store
     */
    static create(storeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`INSERT INTO stores (name, email, address, owner_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, address, owner_id, created_at`, [storeData.name, storeData.email, storeData.address, storeData.owner_id]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error creating store:', error);
                return null;
            }
        });
    }
    /**
     * Find store by ID
     */
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM stores WHERE id = $1', [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error finding store by ID:', error);
                return null;
            }
        });
    }
    /**
     * Get all stores
     */
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM stores ORDER BY created_at DESC');
                return result.rows;
            }
            catch (error) {
                console.error('Error getting all stores:', error);
                return [];
            }
        });
    }
    /**
     * Get stores by owner ID
     */
    static getByOwnerId(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM stores WHERE owner_id = $1 ORDER BY created_at DESC', [ownerId]);
                return result.rows;
            }
            catch (error) {
                console.error('Error getting stores by owner ID:', error);
                return [];
            }
        });
    }
    /**
     * Update store
     */
    static update(id, storeData) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const result = yield db_1.default.query(query, values);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error updating store:', error);
                return null;
            }
        });
    }
    /**
     * Delete store by ID
     */
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('DELETE FROM stores WHERE id = $1 RETURNING id', [id]);
                return result.rowCount !== null && result.rowCount > 0;
            }
            catch (error) {
                console.error('Error deleting store:', error);
                return false;
            }
        });
    }
}
exports.StoreModel = StoreModel;
