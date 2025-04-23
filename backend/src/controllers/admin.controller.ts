import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/user.model';
import { StoreModel } from '../models/store.model';
import { RatingModel } from '../models/rating.model';
import pool from '../config/db';
import { User } from '../models/user.model';

// @desc      Get all users
// @route     GET /api/admin/users
// @access    Private (Admin only)
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await UserModel.getAll();

    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get user by ID
// @route     GET /api/admin/users/:id
// @access    Private (Admin only)
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await UserModel.findById(parseInt(req.params.id));

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Update user
// @route     PUT /api/admin/users/:id
// @access    Private (Admin only)
export const updateUser = async (
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

    const userId = parseInt(req.params.id);
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    const { name, email, address, role, password } = req.body;

    // Check if email is taken by another user
    if (email && email !== user.email) {
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
    const updatedUser = await UserModel.update(userId, {
      name: name || user.name,
      email: email || user.email,
      address: address || user.address,
      role: role || user.role,
      ...(password && { password }),
    });

    if (!updatedUser) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to update user',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Delete user
// @route     DELETE /api/admin/users/:id
// @access    Private (Admin only)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Admin can't delete themselves
    if (userId === req.user.id) {
      res.status(400).json({
        status: 'error',
        message: 'Admin cannot delete their own account',
      });
      return;
    }

    const success = await UserModel.delete(userId);

    if (!success) {
      res.status(404).json({
        status: 'error',
        message: 'User not found or could not be deleted',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get all stores
// @route     GET /api/admin/stores
// @access    Private (Admin only)
export const getAllStoresAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stores = await StoreModel.getAll();

    // For each store, get owner details and average rating
    const storesWithDetails = await Promise.all(
      stores.map(async (store) => {
        const owner = await UserModel.findById(store.owner_id);
        const avgRating = await RatingModel.getAverageRating(store.id as number);

        return {
          ...store,
          owner_name: owner ? owner.name : 'Unknown',
          owner_email: owner ? owner.email : 'Unknown',
          average_rating: avgRating,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      count: stores.length,
      data: storesWithDetails,
    });
  } catch (error) {
    console.error('Get all stores admin error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Delete store
// @route     DELETE /api/admin/stores/:id
// @access    Private (Admin only)
export const deleteStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = parseInt(req.params.id);
    const success = await StoreModel.delete(storeId);

    if (!success) {
      res.status(404).json({
        status: 'error',
        message: 'Store not found or could not be deleted',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Store deleted successfully',
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get dashboard statistics
// @route     GET /api/admin/dashboard-stats
// @access    Private (Admin only)
export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total stores count
    const storesResult = await pool.query('SELECT COUNT(*) FROM stores');
    const totalStores = parseInt(storesResult.rows[0].count);

    // Get total ratings count
    const ratingsResult = await pool.query('SELECT COUNT(*) FROM ratings');
    const totalRatings = parseInt(ratingsResult.rows[0].count);

    // Get average rating across all stores
    const avgRatingResult = await pool.query('SELECT AVG(rating) FROM ratings');
    const averageRating = avgRatingResult.rows[0].avg
      ? parseFloat(avgRatingResult.rows[0].avg)
      : 0;

    // Get user count by role
    const roleCountsResult = await pool.query(
      'SELECT role, COUNT(*) FROM users GROUP BY role'
    );
    const usersByRole = roleCountsResult.rows.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      },
      {}
    );

    // Get top rated stores
    const topStoresResult = await pool.query(`
      SELECT s.id, s.name, AVG(r.rating) as average_rating, COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
      HAVING COUNT(r.id) > 0
      ORDER BY average_rating DESC, rating_count DESC
      LIMIT 5
    `);
    const topRatedStores = topStoresResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      average_rating: parseFloat(row.average_rating).toFixed(1),
      rating_count: parseInt(row.rating_count),
    }));

    // Get recent ratings
    const recentRatingsResult = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, 
             u.name as user_name, s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    const recentRatings = recentRatingsResult.rows;

    // For user dashboard, get user-specific stats if not admin
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    // Get user's rated stores count (only for regular users)
    let ratedStores = 0;
    if (!isAdmin && userId) {
      const userRatingsResult = await pool.query(
        'SELECT COUNT(DISTINCT store_id) FROM ratings WHERE user_id = $1',
        [userId]
      );
      ratedStores = parseInt(userRatingsResult.rows[0].count || '0');
    }

    res.status(200).json({
      status: 'success',
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
        averageRating,
        ratedStores,
      },
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        averageRating,
        usersByRole,
        topRatedStores,
        recentRatings,
        ratedStores,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Create new store
// @route     POST /api/admin/stores
// @access    Private (Admin only)
export const createStore = async (
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

    const { name, email, address, owner_id } = req.body;

    // Check if owner exists and is a store_owner
    const owner = await UserModel.findById(owner_id);
    if (!owner) {
      res.status(404).json({
        status: 'error',
        message: 'Store owner not found',
      });
      return;
    }

    if (owner.role !== 'store_owner') {
      res.status(400).json({
        status: 'error',
        message: 'The specified user is not a store owner',
      });
      return;
    }

    // Create store
    const store = await StoreModel.create({
      name,
      email,
      address,
      owner_id,
    });

    if (!store) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to create store',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      data: store,
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Create new user
// @route     POST /api/admin/users
// @access    Private (Admin only)
export const createUser = async (
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

    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'Email already in use',
      });
      return;
    }

    // Create user
    const user = await UserModel.create({
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

    // Remove password from response
    const userResponse = { ...user } as Partial<User>;
    if (userResponse.password) {
      delete userResponse.password;
    }

    res.status(201).json({
      status: 'success',
      data: userResponse,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
}; 