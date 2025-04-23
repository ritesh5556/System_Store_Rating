import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllStoresAdmin,
  deleteStore,
  getDashboardStats,
  createStore,
  createUser
} from '../controllers/admin.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect, authorize('admin'));

// Validation rules for user update
const userUpdateValidation = [
  body('name')
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please include a valid email'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must be maximum 400 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Invalid role'),
  body('password')
    .optional()
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must include at least one uppercase letter and one special character'),
];

// Validation rules for user creation
const userCreateValidation = [
  body('name')
    .isLength({ min: 10, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .isEmail()
    .withMessage('Please include a valid email'),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address must be maximum 400 characters'),
  body('role')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Invalid role'),
  body('password')
    .isLength({ min: 6, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    // .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    // .withMessage('Password must include at least one uppercase letter and one special character'),
];

// Validation rules for store creation
const storeCreateValidation = [
  body('name').notEmpty().withMessage('Store name is required'),
  body('email')
    .isEmail()
    .withMessage('Please include a valid email'),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address must be maximum 400 characters'),
  body('owner_id')
    .isNumeric()
    .withMessage('Owner ID must be a number'),
];

// User routes
router.get('/users', getAllUsers);
router.post('/users', userCreateValidation, createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', userUpdateValidation, updateUser);
router.delete('/users/:id', deleteUser);

// Store routes
router.get('/stores', getAllStoresAdmin);
router.post('/stores', storeCreateValidation, createStore);
router.delete('/stores/:id', deleteStore);

// Dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

export default router; 