import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StoreModel } from '../models/store.model';
import { RatingModel } from '../models/rating.model';
import { UserModel } from '../models/user.model';

// @desc      Get all stores
// @route     GET /api/stores
// @access    Public
export const getAllStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stores = await StoreModel.getAll();

    // For each store, get its average rating
    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const avgRating = await RatingModel.getAverageRating(store.id as number);
        return {
          ...store,
          average_rating: avgRating,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      count: stores.length,
      data: storesWithRatings,
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get store by ID
// @route     GET /api/stores/:id
// @access    Public
export const getStoreById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const store = await StoreModel.findById(parseInt(req.params.id));

    if (!store) {
      res.status(404).json({
        status: 'error',
        message: 'Store not found',
      });
      return;
    }

    // Get store's average rating
    const avgRating = await RatingModel.getAverageRating(store.id as number);
    const storeWithRating = {
      ...store,
      average_rating: avgRating,
    };

    res.status(200).json({
      status: 'success',
      data: storeWithRating,
    });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Create a store
// @route     POST /api/stores
// @access    Private (Store Owner or Admin)
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

    // Only admin and store_owner can create stores
    if (req.user.role !== 'admin' && req.user.role !== 'store_owner') {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to create a store',
      });
      return;
    }

    const { name, email, address } = req.body;

    // Create store
    const store = await StoreModel.create({
      name,
      email,
      address,
      owner_id: req.user.id,
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

// @desc      Update a store
// @route     PUT /api/stores/:id
// @access    Private (Owner of the store or Admin)
export const updateStore = async (
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

    const storeId = parseInt(req.params.id);
    const store = await StoreModel.findById(storeId);

    if (!store) {
      res.status(404).json({
        status: 'error',
        message: 'Store not found',
      });
      return;
    }

    // Check ownership or admin role
    if (store.owner_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this store',
      });
      return;
    }

    const { name, email, address } = req.body;

    // Update store
    const updatedStore = await StoreModel.update(storeId, {
      name: name || store.name,
      email: email || store.email,
      address: address || store.address,
    });

    if (!updatedStore) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to update store',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updatedStore,
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get store ratings
// @route     GET /api/stores/:id/ratings
// @access    Public
export const getStoreRatings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = parseInt(req.params.id);
    const store = await StoreModel.findById(storeId);

    if (!store) {
      res.status(404).json({
        status: 'error',
        message: 'Store not found',
      });
      return;
    }

    const ratings = await RatingModel.getByStoreId(storeId);

    res.status(200).json({
      status: 'success',
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Create or update store rating
// @route     POST /api/stores/:id/ratings
// @access    Private
export const rateStore = async (
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

    const storeId = parseInt(req.params.id);
    const store = await StoreModel.findById(storeId);

    if (!store) {
      res.status(404).json({
        status: 'error',
        message: 'Store not found',
      });
      return;
    }

    // Store owners can't rate their own stores
    if (store.owner_id === req.user.id) {
      res.status(403).json({
        status: 'error',
        message: 'You cannot rate your own store',
      });
      return;
    }

    const { rating, comment } = req.body;

    // Check if user has already rated this store
    const existingRating = await RatingModel.findByUserAndStore(
      req.user.id,
      storeId
    );

    let result;
    if (existingRating) {
      // Update existing rating
      result = await RatingModel.update(existingRating.id as number, {
        rating,
        comment,
      });

      if (!result) {
        res.status(400).json({
          status: 'error',
          message: 'Failed to update rating',
        });
        return;
      }
    } else {
      // Create new rating
      result = await RatingModel.create({
        user_id: req.user.id,
        store_id: storeId,
        rating,
        comment,
      });

      if (!result) {
        res.status(400).json({
          status: 'error',
          message: 'Failed to create rating',
        });
        return;
      }
    }

    res.status(existingRating ? 200 : 201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Rate store error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Get store owner profile
// @route     GET /api/stores/owner/profile
// @access    Private (Store Owner)
export const getStoreOwnerProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is a store owner
    if (req.user.role !== 'store_owner') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Only store owners can access this resource.',
      });
      return;
    }

    // Get stores owned by the user to count them
    const stores = await StoreModel.getByOwnerId(req.user.id);

    const profileData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      storeCount: stores.length,
    };

    res.status(200).json({
      status: 'success',
      data: profileData,
    });
  } catch (error) {
    console.error('Get store owner profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Update store owner profile
// @route     PUT /api/stores/owner/profile
// @access    Private (Store Owner)
export const updateStoreOwnerProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is a store owner
    if (req.user.role !== 'store_owner') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Only store owners can update their profile.',
      });
      return;
    }

    const { name } = req.body;

    // Update user profile
    const updatedUser = await UserModel.update(req.user.id, { name });

    if (!updatedUser) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to update profile',
      });
      return;
    }

    // Get stores owned by the user to count them
    const stores = await StoreModel.getByOwnerId(req.user.id);

    const profileData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      storeCount: stores.length,
    };

    res.status(200).json({
      status: 'success',
      data: profileData,
    });
  } catch (error) {
    console.error('Update store owner profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
}; 