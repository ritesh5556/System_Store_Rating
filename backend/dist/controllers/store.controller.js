"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreOwnerProfile = exports.getStoreOwnerProfile = exports.rateStore = exports.getStoreRatings = exports.updateStore = exports.createStore = exports.getStoreById = exports.getAllStores = void 0;
const express_validator_1 = require("express-validator");
const store_model_1 = require("../models/store.model");
const rating_model_1 = require("../models/rating.model");
const user_model_1 = require("../models/user.model");
// @desc      Get all stores
// @route     GET /api/stores
// @access    Public
const getAllStores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stores = yield store_model_1.StoreModel.getAll();
        // For each store, get its average rating
        const storesWithRatings = yield Promise.all(stores.map((store) => __awaiter(void 0, void 0, void 0, function* () {
            const avgRating = yield rating_model_1.RatingModel.getAverageRating(store.id);
            return Object.assign(Object.assign({}, store), { average_rating: avgRating });
        })));
        res.status(200).json({
            status: 'success',
            count: stores.length,
            data: storesWithRatings,
        });
    }
    catch (error) {
        console.error('Get all stores error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getAllStores = getAllStores;
// @desc      Get store by ID
// @route     GET /api/stores/:id
// @access    Public
const getStoreById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store = yield store_model_1.StoreModel.findById(parseInt(req.params.id));
        if (!store) {
            res.status(404).json({
                status: 'error',
                message: 'Store not found',
            });
            return;
        }
        // Get store's average rating
        const avgRating = yield rating_model_1.RatingModel.getAverageRating(store.id);
        const storeWithRating = Object.assign(Object.assign({}, store), { average_rating: avgRating });
        res.status(200).json({
            status: 'success',
            data: storeWithRating,
        });
    }
    catch (error) {
        console.error('Get store by ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getStoreById = getStoreById;
// @desc      Create a store
// @route     POST /api/stores
// @access    Private (Store Owner or Admin)
const createStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
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
        const store = yield store_model_1.StoreModel.create({
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
    }
    catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.createStore = createStore;
// @desc      Update a store
// @route     PUT /api/stores/:id
// @access    Private (Owner of the store or Admin)
const updateStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                errors: errors.array(),
            });
            return;
        }
        const storeId = parseInt(req.params.id);
        const store = yield store_model_1.StoreModel.findById(storeId);
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
        const updatedStore = yield store_model_1.StoreModel.update(storeId, {
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
    }
    catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.updateStore = updateStore;
// @desc      Get store ratings
// @route     GET /api/stores/:id/ratings
// @access    Public
const getStoreRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeId = parseInt(req.params.id);
        const store = yield store_model_1.StoreModel.findById(storeId);
        if (!store) {
            res.status(404).json({
                status: 'error',
                message: 'Store not found',
            });
            return;
        }
        const ratings = yield rating_model_1.RatingModel.getByStoreId(storeId);
        res.status(200).json({
            status: 'success',
            count: ratings.length,
            data: ratings,
        });
    }
    catch (error) {
        console.error('Get store ratings error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getStoreRatings = getStoreRatings;
// @desc      Create or update store rating
// @route     POST /api/stores/:id/ratings
// @access    Private
const rateStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                errors: errors.array(),
            });
            return;
        }
        const storeId = parseInt(req.params.id);
        const store = yield store_model_1.StoreModel.findById(storeId);
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
        const existingRating = yield rating_model_1.RatingModel.findByUserAndStore(req.user.id, storeId);
        let result;
        if (existingRating) {
            // Update existing rating
            result = yield rating_model_1.RatingModel.update(existingRating.id, {
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
        }
        else {
            // Create new rating
            result = yield rating_model_1.RatingModel.create({
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
    }
    catch (error) {
        console.error('Rate store error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.rateStore = rateStore;
// @desc      Get store owner profile
// @route     GET /api/stores/owner/profile
// @access    Private (Store Owner)
const getStoreOwnerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const stores = yield store_model_1.StoreModel.getByOwnerId(req.user.id);
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
    }
    catch (error) {
        console.error('Get store owner profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.getStoreOwnerProfile = getStoreOwnerProfile;
// @desc      Update store owner profile
// @route     PUT /api/stores/owner/profile
// @access    Private (Store Owner)
const updateStoreOwnerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updatedUser = yield user_model_1.UserModel.update(req.user.id, { name });
        if (!updatedUser) {
            res.status(400).json({
                status: 'error',
                message: 'Failed to update profile',
            });
            return;
        }
        // Get stores owned by the user to count them
        const stores = yield store_model_1.StoreModel.getByOwnerId(req.user.id);
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
    }
    catch (error) {
        console.error('Update store owner profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
});
exports.updateStoreOwnerProfile = updateStoreOwnerProfile;
