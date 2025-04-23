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
exports.initDatabase = void 0;
const user_model_1 = require("../models/user.model");
const store_model_1 = require("../models/store.model");
const rating_model_1 = require("../models/rating.model");
/**
 * Initialize the database with tables and seed data
 */
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Initializing database...');
        // Create tables
        yield user_model_1.UserModel.createTable();
        yield store_model_1.StoreModel.createTable();
        yield rating_model_1.RatingModel.createTable();
        // Check if admin user exists
        const adminExists = yield user_model_1.UserModel.findByEmail('admin@example.com');
        if (!adminExists) {
            console.log('Creating admin user...');
            // Create admin user
            yield user_model_1.UserModel.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                address: 'Admin Address',
                role: 'admin',
            });
        }
        // Check if test users exist
        const testUserExists = yield user_model_1.UserModel.findByEmail('user@example.com');
        if (!testUserExists) {
            console.log('Creating test users...');
            // Create regular user
            const regularUser = yield user_model_1.UserModel.create({
                name: 'Regular User',
                email: 'user@example.com',
                password: 'user123',
                address: 'User Address',
                role: 'user',
            });
            // Create store owner
            const storeOwner = yield user_model_1.UserModel.create({
                name: 'Store Owner',
                email: 'storeowner@example.com',
                password: 'store123',
                address: 'Store Owner Address',
                role: 'store_owner',
            });
            if (storeOwner && regularUser) {
                console.log('Creating test stores...');
                // Create test stores
                const store1 = yield store_model_1.StoreModel.create({
                    name: 'Test Store 1',
                    email: 'store1@example.com',
                    address: '123 Test St',
                    owner_id: storeOwner.id,
                });
                const store2 = yield store_model_1.StoreModel.create({
                    name: 'Test Store 2',
                    email: 'store2@example.com',
                    address: '456 Test Rd',
                    owner_id: storeOwner.id,
                });
                if (store1 && store2) {
                    console.log('Creating test ratings...');
                    // Create test ratings
                    yield rating_model_1.RatingModel.create({
                        user_id: regularUser.id,
                        store_id: store1.id,
                        rating: 4,
                        comment: 'Great store!',
                    });
                    yield rating_model_1.RatingModel.create({
                        user_id: regularUser.id,
                        store_id: store2.id,
                        rating: 5,
                        comment: 'Excellent service!',
                    });
                }
            }
        }
        console.log('Database initialization complete!');
    }
    catch (error) {
        console.error('Database initialization error:', error);
    }
});
exports.initDatabase = initDatabase;
exports.default = exports.initDatabase;
