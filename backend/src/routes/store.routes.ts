import express from 'express';
import { body } from 'express-validator';
import {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  getStoreRatings,
  rateStore,
  getStoreOwnerProfile,
  updateStoreOwnerProfile,
} from '../controllers/store.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Validation rules
const storeValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('address').notEmpty().withMessage('Address is required'),
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment').optional(),
];

const profileUpdateValidation = [
  body('name').notEmpty().withMessage('Name is required'),
];

// Public routes
router.get('/', getAllStores);

// Store owner profile routes
router.get('/owner/profile', protect, getStoreOwnerProfile);
router.put('/owner/profile', protect, profileUpdateValidation, updateStoreOwnerProfile);

// Param-based routes
router.get('/:id', getStoreById);
router.get('/:id/ratings', getStoreRatings);
router.post('/:id/ratings', protect, ratingValidation, rateStore);
router.put('/:id', protect, storeValidation, updateStore);

// Other protected routes
router.post('/', protect, storeValidation, createStore);

export default router; 