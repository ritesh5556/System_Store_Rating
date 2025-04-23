import { UserModel } from '../models/user.model';
import { StoreModel } from '../models/store.model';
import { RatingModel } from '../models/rating.model';
import bcrypt from 'bcrypt';
import pool from '../config/db';

/**
 * Initialize the database with tables and seed data
 */
export const initDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');

    // Create tables
    await UserModel.createTable();
    await StoreModel.createTable();
    await RatingModel.createTable();

    // Check if admin user exists
    const adminExists = await UserModel.findByEmail('admin@example.com');
    
    if (!adminExists) {
      console.log('Creating admin user...');
      // Create admin user
      await UserModel.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        address: 'Admin Address',
        role: 'admin',
      });
    }

    // Check if test users exist
    const testUserExists = await UserModel.findByEmail('user@example.com');
    
    if (!testUserExists) {
      console.log('Creating test users...');
      // Create regular user
      const regularUser = await UserModel.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user123',
        address: 'User Address',
        role: 'user',
      });

      // Create store owner
      const storeOwner = await UserModel.create({
        name: 'Store Owner',
        email: 'storeowner@example.com',
        password: 'store123',
        address: 'Store Owner Address',
        role: 'store_owner',
      });

      if (storeOwner && regularUser) {
        console.log('Creating test stores...');
        // Create test stores
        const store1 = await StoreModel.create({
          name: 'Test Store 1',
          email: 'store1@example.com',
          address: '123 Test St',
          owner_id: storeOwner.id as number,
        });

        const store2 = await StoreModel.create({
          name: 'Test Store 2',
          email: 'store2@example.com',
          address: '456 Test Rd',
          owner_id: storeOwner.id as number,
        });

        if (store1 && store2) {
          console.log('Creating test ratings...');
          // Create test ratings
          await RatingModel.create({
            user_id: regularUser.id as number,
            store_id: store1.id as number,
            rating: 4,
            comment: 'Great store!',
          });

          await RatingModel.create({
            user_id: regularUser.id as number,
            store_id: store2.id as number,
            rating: 5,
            comment: 'Excellent service!',
          });
        }
      }
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default initDatabase; 