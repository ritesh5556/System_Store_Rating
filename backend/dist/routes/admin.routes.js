"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Apply auth middleware to all admin routes
router.use(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'));
// Validation rules for user update
const userUpdateValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 20, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Please include a valid email'),
    (0, express_validator_1.body)('address')
        .optional()
        .isLength({ max: 400 })
        .withMessage('Address must be maximum 400 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'user', 'store_owner'])
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must include at least one uppercase letter and one special character'),
];
// Validation rules for user creation
const userCreateValidation = [
    (0, express_validator_1.body)('name')
        .isLength({ min: 10, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please include a valid email'),
    (0, express_validator_1.body)('address')
        .isLength({ max: 400 })
        .withMessage('Address must be maximum 400 characters'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'user', 'store_owner'])
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6, max: 16 })
        .withMessage('Password must be between 8 and 16 characters')
    // .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    // .withMessage('Password must include at least one uppercase letter and one special character'),
];
// Validation rules for store creation
const storeCreateValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Store name is required'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please include a valid email'),
    (0, express_validator_1.body)('address')
        .isLength({ max: 400 })
        .withMessage('Address must be maximum 400 characters'),
    (0, express_validator_1.body)('owner_id')
        .isNumeric()
        .withMessage('Owner ID must be a number'),
];
// User routes
router.get('/users', admin_controller_1.getAllUsers);
router.post('/users', userCreateValidation, admin_controller_1.createUser);
router.get('/users/:id', admin_controller_1.getUserById);
router.put('/users/:id', userUpdateValidation, admin_controller_1.updateUser);
router.delete('/users/:id', admin_controller_1.deleteUser);
// Store routes
router.get('/stores', admin_controller_1.getAllStoresAdmin);
router.post('/stores', storeCreateValidation, admin_controller_1.createStore);
router.delete('/stores/:id', admin_controller_1.deleteStore);
// Dashboard statistics
router.get('/dashboard-stats', admin_controller_1.getDashboardStats);
exports.default = router;
