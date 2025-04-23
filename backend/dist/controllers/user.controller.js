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
exports.getUserDashboardStats = exports.getUserRatings = exports.updateUserProfile = exports.getUserProfile = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = require("../models/user.model");
const rating_model_1 = require("../models/rating.model");
const db_1 = __importDefault(require("../config/db"));
// @desc      Get user profile
// @route     GET /api/users/profile
// @access    Private
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({
            status: 'success',
            data: req.user,
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getUserProfile = getUserProfile;
// @desc      Update user profile
// @route     PUT /api/users/profile
// @access    Private
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { name, email, address } = req.body;
        // Check if email is already taken by a different user
        if (email && email !== req.user.email) {
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
        const updatedUser = yield user_model_1.UserModel.update(req.user.id, {
            name: name || req.user.name,
            email: email || req.user.email,
            address: address || req.user.address,
        });
        if (!updatedUser) {
            res.status(400).json({
                status: 'error',
                message: 'Failed to update profile',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: updatedUser,
        });
    }
    catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.updateUserProfile = updateUserProfile;
// @desc      Get user ratings
// @route     GET /api/users/ratings
// @access    Private
const getUserRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield rating_model_1.RatingModel.getByUserId(req.user.id);
        res.status(200).json({
            status: 'success',
            count: ratings.length,
            data: ratings,
        });
    }
    catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getUserRatings = getUserRatings;
// @desc      Get user dashboard statistics
// @route     GET /api/users/dashboard-stats
// @access    Private
const getUserDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }
        // Get total ratings by this user
        const userRatingsResult = yield db_1.default.query('SELECT COUNT(*) FROM ratings WHERE user_id = $1', [userId]);
        const totalRatings = parseInt(userRatingsResult.rows[0].count || '0');
        // Get total stores rated by this user
        const ratedStoresResult = yield db_1.default.query('SELECT COUNT(DISTINCT store_id) FROM ratings WHERE user_id = $1', [userId]);
        const ratedStores = parseInt(ratedStoresResult.rows[0].count || '0');
        // Get average rating given by this user
        const avgRatingResult = yield db_1.default.query('SELECT AVG(rating) FROM ratings WHERE user_id = $1', [userId]);
        const averageRating = avgRatingResult.rows[0].avg
            ? parseFloat(avgRatingResult.rows[0].avg)
            : 0;
        res.status(200).json({
            status: 'success',
            stats: {
                totalRatings,
                ratedStores,
                averageRating,
            },
        });
    }
    catch (error) {
        console.error('Get user dashboard stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getUserDashboardStats = getUserDashboardStats;
