"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Validation rules
const profileUpdateValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Please include a valid email'),
    (0, express_validator_1.body)('address').optional().notEmpty().withMessage('Address cannot be empty'),
];
// Routes
router.get('/profile', auth_middleware_1.protect, user_controller_1.getUserProfile);
router.put('/profile', auth_middleware_1.protect, profileUpdateValidation, user_controller_1.updateUserProfile);
router.get('/ratings', auth_middleware_1.protect, user_controller_1.getUserRatings);
router.get('/dashboard-stats', auth_middleware_1.protect, user_controller_1.getUserDashboardStats);
exports.default = router;
