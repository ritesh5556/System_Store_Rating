import express from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must include at least one uppercase letter and one special character'),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address must be maximum 400 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
];

const passwordUpdateValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 6 and 16 characters')
    // Comment out strict password requirements for testing
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('New password must include at least one uppercase letter and one special character'),
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/password-update', protect, passwordUpdateValidation, updatePassword);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router; 
