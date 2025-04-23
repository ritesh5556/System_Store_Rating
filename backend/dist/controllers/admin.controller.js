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
exports.createUser = exports.createStore = exports.getDashboardStats = exports.deleteStore = exports.getAllStoresAdmin = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = require("../models/user.model");
const store_model_1 = require("../models/store.model");
const rating_model_1 = require("../models/rating.model");
const db_1 = __importDefault(require("../config/db"));
// @desc      Get all users
// @route     GET /api/admin/users
// @access    Private (Admin only)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.UserModel.getAll();
        res.status(200).json({
            status: 'success',
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getAllUsers = getAllUsers;
// @desc      Get user by ID
// @route     GET /api/admin/users/:id
// @access    Private (Admin only)
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.UserModel.findById(parseInt(req.params.id));
        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: user,
        });
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getUserById = getUserById;
// @desc      Update user
// @route     PUT /api/admin/users/:id
// @access    Private (Admin only)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                errors: errors.array(),
            });
            return;
        }
        const userId = parseInt(req.params.id);
        const user = yield user_model_1.UserModel.findById(userId);
        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }
        const { name, email, address, role, password } = req.body;
        // Check if email is taken by another user
        if (email && email !== user.email) {
            const existingUser = yield user_model_1.UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({
                    status: 'error',
                    message: 'Email already in use',
                });
                return;
            }
        }
        // Update user
        const updatedUser = yield user_model_1.UserModel.update(userId, Object.assign({ name: name || user.name, email: email || user.email, address: address || user.address, role: role || user.role }, (password && { password })));
        if (!updatedUser) {
            res.status(400).json({
                status: 'error',
                message: 'Failed to update user',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: updatedUser,
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.updateUser = updateUser;
// @desc      Delete user
// @route     DELETE /api/admin/users/:id
// @access    Private (Admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        // Admin can't delete themselves
        if (userId === req.user.id) {
            res.status(400).json({
                status: 'error',
                message: 'Admin cannot delete their own account',
            });
            return;
        }
        const success = yield user_model_1.UserModel.delete(userId);
        if (!success) {
            res.status(404).json({
                status: 'error',
                message: 'User not found or could not be deleted',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.deleteUser = deleteUser;
// @desc      Get all stores
// @route     GET /api/admin/stores
// @access    Private (Admin only)
const getAllStoresAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stores = yield store_model_1.StoreModel.getAll();
        // For each store, get owner details and average rating
        const storesWithDetails = yield Promise.all(stores.map((store) => __awaiter(void 0, void 0, void 0, function* () {
            const owner = yield user_model_1.UserModel.findById(store.owner_id);
            const avgRating = yield rating_model_1.RatingModel.getAverageRating(store.id);
            return Object.assign(Object.assign({}, store), { owner_name: owner ? owner.name : 'Unknown', owner_email: owner ? owner.email : 'Unknown', average_rating: avgRating });
        })));
        res.status(200).json({
            status: 'success',
            count: stores.length,
            data: storesWithDetails,
        });
    }
    catch (error) {
        console.error('Get all stores admin error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getAllStoresAdmin = getAllStoresAdmin;
// @desc      Delete store
// @route     DELETE /api/admin/stores/:id
// @access    Private (Admin only)
const deleteStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeId = parseInt(req.params.id);
        const success = yield store_model_1.StoreModel.delete(storeId);
        if (!success) {
            res.status(404).json({
                status: 'error',
                message: 'Store not found or could not be deleted',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Store deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.deleteStore = deleteStore;
// @desc      Get dashboard statistics
// @route     GET /api/admin/dashboard-stats
// @access    Private (Admin only)
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Get total users count
        const usersResult = yield db_1.default.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(usersResult.rows[0].count);
        // Get total stores count
        const storesResult = yield db_1.default.query('SELECT COUNT(*) FROM stores');
        const totalStores = parseInt(storesResult.rows[0].count);
        // Get total ratings count
        const ratingsResult = yield db_1.default.query('SELECT COUNT(*) FROM ratings');
        const totalRatings = parseInt(ratingsResult.rows[0].count);
        // Get average rating across all stores
        const avgRatingResult = yield db_1.default.query('SELECT AVG(rating) FROM ratings');
        const averageRating = avgRatingResult.rows[0].avg
            ? parseFloat(avgRatingResult.rows[0].avg)
            : 0;
        // Get user count by role
        const roleCountsResult = yield db_1.default.query('SELECT role, COUNT(*) FROM users GROUP BY role');
        const usersByRole = roleCountsResult.rows.reduce((acc, row) => {
            acc[row.role] = parseInt(row.count);
            return acc;
        }, {});
        // Get top rated stores
        const topStoresResult = yield db_1.default.query(`
      SELECT s.id, s.name, AVG(r.rating) as average_rating, COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
      HAVING COUNT(r.id) > 0
      ORDER BY average_rating DESC, rating_count DESC
      LIMIT 5
    `);
        const topRatedStores = topStoresResult.rows.map((row) => ({
            id: row.id,
            name: row.name,
            average_rating: parseFloat(row.average_rating).toFixed(1),
            rating_count: parseInt(row.rating_count),
        }));
        // Get recent ratings
        const recentRatingsResult = yield db_1.default.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, 
             u.name as user_name, s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
        const recentRatings = recentRatingsResult.rows;
        // For user dashboard, get user-specific stats if not admin
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'admin';
        // Get user's rated stores count (only for regular users)
        let ratedStores = 0;
        if (!isAdmin && userId) {
            const userRatingsResult = yield db_1.default.query('SELECT COUNT(DISTINCT store_id) FROM ratings WHERE user_id = $1', [userId]);
            ratedStores = parseInt(userRatingsResult.rows[0].count || '0');
        }
        res.status(200).json({
            status: 'success',
            stats: {
                totalUsers,
                totalStores,
                totalRatings,
                averageRating,
                ratedStores,
            },
            data: {
                totalUsers,
                totalStores,
                totalRatings,
                averageRating,
                usersByRole,
                topRatedStores,
                recentRatings,
                ratedStores,
            },
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getDashboardStats = getDashboardStats;
// @desc      Create new store
// @route     POST /api/admin/stores
// @access    Private (Admin only)
const createStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                errors: errors.array(),
            });
            return;
        }
        const { name, email, address, owner_id } = req.body;
        // Check if owner exists and is a store_owner
        const owner = yield user_model_1.UserModel.findById(owner_id);
        if (!owner) {
            res.status(404).json({
                status: 'error',
                message: 'Store owner not found',
            });
            return;
        }
        if (owner.role !== 'store_owner') {
            res.status(400).json({
                status: 'error',
                message: 'The specified user is not a store owner',
            });
            return;
        }
        // Create store
        const store = yield store_model_1.StoreModel.create({
            name,
            email,
            address,
            owner_id,
        });
        if (!store) {
            res.status(400).json({
                status: 'error',
                message: 'Failed to create store',
            });
            return;
        }
        res.status(201).json({
            status: 'success',
            data: store,
        });
    }
    catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.createStore = createStore;
// @desc      Create new user
// @route     POST /api/admin/users
// @access    Private (Admin only)
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                errors: errors.array(),
            });
            return;
        }
        const { name, email, password, address, role } = req.body;
        // Check if user exists
        const existingUser = yield user_model_1.UserModel.findByEmail(email);
        if (existingUser) {
            res.status(400).json({
                status: 'error',
                message: 'Email already in use',
            });
            return;
        }
        // Create user
        const user = yield user_model_1.UserModel.create({
            name,
            email,
            password,
            address,
            role: role || 'user',
        });
        if (!user) {
            res.status(400).json({
                status: 'error',
                message: 'Failed to create user',
            });
            return;
        }
        // Remove password from response
        const userResponse = Object.assign({}, user);
        if (userResponse.password) {
            delete userResponse.password;
        }
        res.status(201).json({
            status: 'success',
            data: userResponse,
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.createUser = createUser;
