import express from 'express';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  getUserRatings,
  getUserDashboardStats
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Validation rules
const profileUpdateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please include a valid email'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty'),
];

// Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, profileUpdateValidation, updateUserProfile);
router.get('/ratings', protect, getUserRatings);
router.get('/dashboard-stats', protect, getUserDashboardStats);

export default router; 