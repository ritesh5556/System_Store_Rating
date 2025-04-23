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
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
// Middleware to protect routes requiring authentication
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token;
        // Check for token in headers or cookies
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
        }
        else if ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) {
            // Get token from cookie
            token = req.cookies.token;
        }
        // Check if token exists
        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route',
            });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Get user from token
        const user = yield user_model_1.UserModel.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route',
        });
    }
});
exports.protect = protect;
// Middleware to authorize roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'User not authenticated',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                status: 'error',
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
