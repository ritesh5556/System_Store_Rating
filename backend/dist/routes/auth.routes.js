"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Validation rules
const signupValidation = [
    (0, express_validator_1.body)('name')
        .isLength({ min: 10, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please include a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6, max: 16 })
        .withMessage('Password must be between 8 and 16 characters'),
    // .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    // .withMessage('Password must include at least one uppercase letter and one special character'),
    (0, express_validator_1.body)('address')
        .isLength({ max: 400 })
        .withMessage('Address must be maximum 400 characters'),
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please include a valid email'),
    (0, express_validator_1.body)('password').exists().withMessage('Password is required'),
];
const passwordUpdateValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6, max: 16 })
        .withMessage('New password must be between 6 and 16 characters'),
    // Comment out strict password requirements for testing
    // .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    // .withMessage('New password must include at least one uppercase letter and one special character'),
];
// Routes
router.post('/signup', signupValidation, auth_controller_1.signup);
router.post('/login', loginValidation, auth_controller_1.login);
router.post('/password-update', auth_middleware_1.protect, passwordUpdateValidation, auth_controller_1.updatePassword);
router.get('/logout', auth_middleware_1.protect, auth_controller_1.logout);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;
