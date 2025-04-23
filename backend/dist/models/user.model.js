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
exports.UserModel = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    /**
     * Create database table if not exists
     */
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.default.query(`
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
            }
            catch (error) {
                console.error('Error creating users table:', error);
            }
        });
    }
    /**
     * Create a new user
     */
    static create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
                const result = yield db_1.default.query(`INSERT INTO users (name, email, password, address, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at`, [userData.name, userData.email, hashedPassword, userData.address, userData.role]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error creating user:', error);
                return null;
            }
        });
    }
    /**
     * Find a user by email
     */
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error finding user by email:', error);
                return null;
            }
        });
    }
    /**
     * Find a user by ID
     */
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = $1', [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error finding user by ID:', error);
                return null;
            }
        });
    }
    /**
     * Update a user
     */
    static update(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    const salt = yield bcrypt_1.default.genSalt(10);
                    const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
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
                const result = yield db_1.default.query(query, values);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error updating user:', error);
                return null;
            }
        });
    }
    /**
     * Get all users
     */
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT id, name, email, address, role, created_at FROM users');
                return result.rows;
            }
            catch (error) {
                console.error('Error getting all users:', error);
                return [];
            }
        });
    }
    /**
     * Delete a user
     */
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
                return result.rowCount !== null && result.rowCount > 0;
            }
            catch (error) {
                console.error('Error deleting user:', error);
                return false;
            }
        });
    }
    /**
     * Compare password with hashed password
     */
    static comparePassword(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(password, hashedPassword);
        });
    }
}
exports.UserModel = UserModel;
