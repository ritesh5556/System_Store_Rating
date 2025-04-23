import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/user.model';
import { RatingModel } from '../models/rating.model';
import pool from '../config/db';

// @desc      Get user profile
// @route     GET /api/users/profile
// @access    Private
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      status: 'success',
      data: req.user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Update user profile
// @route     PUT /api/users/profile
// @access    Private
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
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
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'Email already in use',
        });
        return;
      }
    }

    // Update user
    const updatedUser = await UserModel.update(req.user.id, {
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
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get user ratings
// @route     GET /api/users/ratings
// @access    Private
export const getUserRatings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ratings = await RatingModel.getByUserId(req.user.id);

    res.status(200).json({
      status: 'success',
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get user dashboard statistics
// @route     GET /api/users/dashboard-stats
// @access    Private
export const getUserDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authorized',
      });
      return;
    }

    // Get total ratings by this user
    const userRatingsResult = await pool.query(
      'SELECT COUNT(*) FROM ratings WHERE user_id = $1',
      [userId]
    );
    const totalRatings = parseInt(userRatingsResult.rows[0].count || '0');

    // Get total stores rated by this user
    const ratedStoresResult = await pool.query(
      'SELECT COUNT(DISTINCT store_id) FROM ratings WHERE user_id = $1',
      [userId]
    );
    const ratedStores = parseInt(ratedStoresResult.rows[0].count || '0');

    // Get average rating given by this user
    const avgRatingResult = await pool.query(
      'SELECT AVG(rating) FROM ratings WHERE user_id = $1',
      [userId]
    );
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
  } catch (error) {
    console.error('Get user dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
}; 