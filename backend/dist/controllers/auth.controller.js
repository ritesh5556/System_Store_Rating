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
exports.getMe = exports.logout = exports.updatePassword = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const express_validator_1 = require("express-validator");
// Generate JWT token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    // Explicitly define payload and options types
    const payload = { id };
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '30d')
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
// Set token in cookie
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = generateToken(user.id);
    const cookieOptions = {
        expires: new Date(Date.now() +
            parseInt(process.env.COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };
    // Remove password from response
    const userResponse = Object.assign({}, user);
    if (userResponse.password) {
        delete userResponse.password;
    }
    res
        .status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
        status: 'success',
        token,
        user: userResponse,
    });
};
// @desc      Register user
// @route     POST /api/auth/signup
// @access    Public
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Send token response
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.signup = signup;
// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { email, password } = req.body;
        // Check if user exists
        const user = yield user_model_1.UserModel.findByEmail(email);
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
            return;
        }
        // Check if password matches
        const isMatch = yield user_model_1.UserModel.comparePassword(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
            return;
        }
        // Send token response
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.login = login;
// @desc      Update password
// @route     POST /api/auth/password-update
// @access    Private
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { currentPassword, newPassword } = req.body;
        // Get user with password
        const user = yield user_model_1.UserModel.findByEmail(req.user.email);
        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }
        // Check current password
        const isMatch = yield user_model_1.UserModel.comparePassword(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect',
            });
            return;
        }
        // Update password
        const updatedUser = yield user_model_1.UserModel.update(user.id, {
            password: newPassword,
        });
        if (!updatedUser) {
            res.status(400).json({
                status: 'error',
                message: 'Failed to update password',
            });
            return;
        }
        // Send token response
        sendTokenResponse(updatedUser, 200, res);
    }
    catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.updatePassword = updatePassword;
// @desc      Logout user
// @route     GET /api/auth/logout
// @access    Private
const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
};
exports.logout = logout;
// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
const getMe = (req, res) => {
    res.status(200).json({
        status: 'success',
        user: req.user,
    });
};
exports.getMe = getMe;
