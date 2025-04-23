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
exports.RatingModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class RatingModel {
    /**
     * Create database table if not exists
     */
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.default.query(`
        CREATE TABLE IF NOT EXISTS ratings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, store_id)
        )
      `);
                console.log('Ratings table created or already exists');
            }
            catch (error) {
                console.error('Error creating ratings table:', error);
            }
        });
    }
    /**
     * Create a new rating
     */
    static create(ratingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`INSERT INTO ratings (user_id, store_id, rating, comment) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, user_id, store_id, rating, comment, created_at`, [ratingData.user_id, ratingData.store_id, ratingData.rating, ratingData.comment]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error creating rating:', error);
                return null;
            }
        });
    }
    /**
     * Update a rating
     */
    static update(id, ratingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateFields = [];
                const values = [];
                let paramIndex = 1;
                // Build dynamic query based on provided fields
                if (ratingData.rating) {
                    updateFields.push(`rating = $${paramIndex}`);
                    values.push(ratingData.rating);
                    paramIndex++;
                }
                if (ratingData.comment !== undefined) {
                    updateFields.push(`comment = $${paramIndex}`);
                    values.push(ratingData.comment);
                    paramIndex++;
                }
                if (updateFields.length === 0) {
                    return null;
                }
                values.push(id);
                const query = `
        UPDATE ratings
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, user_id, store_id, rating, comment, created_at
      `;
                const result = yield db_1.default.query(query, values);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error updating rating:', error);
                return null;
            }
        });
    }
    /**
     * Find rating by ID
     */
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM ratings WHERE id = $1', [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error finding rating by ID:', error);
                return null;
            }
        });
    }
    /**
     * Find rating by user_id and store_id
     */
    static findByUserAndStore(userId, storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2', [userId, storeId]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Error finding rating by user and store:', error);
                return null;
            }
        });
    }
    /**
     * Get all ratings for a store
     */
    static getByStoreId(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`SELECT r.*, u.name as user_name 
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`, [storeId]);
                return result.rows;
            }
            catch (error) {
                console.error('Error getting ratings by store ID:', error);
                return [];
            }
        });
    }
    /**
     * Get all ratings by a user
     */
    static getByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`SELECT r.*, s.name as store_name, s.id as store_id
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`, [userId]);
                return result.rows;
            }
            catch (error) {
                console.error('Error getting ratings by user ID:', error);
                return [];
            }
        });
    }
    /**
     * Get average rating for a store
     */
    static getAverageRating(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = $1', [storeId]);
                return result.rows[0].average_rating || null;
            }
            catch (error) {
                console.error('Error getting average rating:', error);
                return null;
            }
        });
    }
    /**
     * Delete rating by ID
     */
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('DELETE FROM ratings WHERE id = $1 RETURNING id', [id]);
                return result.rowCount !== null && result.rowCount > 0;
            }
            catch (error) {
                console.error('Error deleting rating:', error);
                return false;
            }
        });
    }
}
exports.RatingModel = RatingModel;
