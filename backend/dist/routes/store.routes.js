"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Validation rules
const storeValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please include a valid email'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
];
const ratingValidation = [
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment').optional(),
];
const profileUpdateValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
];
// Public routes
router.get('/', store_controller_1.getAllStores);
// Store owner profile routes
router.get('/owner/profile', auth_middleware_1.protect, store_controller_1.getStoreOwnerProfile);
router.put('/owner/profile', auth_middleware_1.protect, profileUpdateValidation, store_controller_1.updateStoreOwnerProfile);
// Param-based routes
router.get('/:id', store_controller_1.getStoreById);
router.get('/:id/ratings', store_controller_1.getStoreRatings);
router.post('/:id/ratings', auth_middleware_1.protect, ratingValidation, store_controller_1.rateStore);
router.put('/:id', auth_middleware_1.protect, storeValidation, store_controller_1.updateStore);
// Other protected routes
router.post('/', auth_middleware_1.protect, storeValidation, store_controller_1.createStore);
exports.default = router;
