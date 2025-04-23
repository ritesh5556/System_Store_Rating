import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, User } from '../models/user.model';
import { validationResult } from 'express-validator';

// Generate JWT token
const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  // Explicitly define payload and options types
  const payload = { id };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any
  };
  return jwt.sign(payload, secret, options);
};

// Set token in cookie
const sendTokenResponse = (
  user: User,
  statusCode: number,
  res: Response
): void => {
  // Create token
  const token = generateToken(user.id as number);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // Remove password from response
  const userResponse = { ...user } as Partial<User>;
  if (userResponse.password) {
    delete userResponse.password;
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      token,
      user: userResponse,
    });
};

// @desc      Register user
// @route     POST /api/auth/signup
// @access    Public
export const signup = async (req: Request, res: Response): Promise<void> => {
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

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
export const login = async (req: Request, res: Response): Promise<void> => {
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

    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if password matches
    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
      return;
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Update password
// @route     POST /api/auth/password-update
// @access    Private
export const updatePassword = async (
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Check current password
    const isMatch = await UserModel.comparePassword(
      currentPassword,
      user.password
    );
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    const updatedUser = await UserModel.update(user.id as number, {
      password: newPassword,
    });

    if (!updatedUser) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to update password',
      });
      return;
    }

    // Send token response
    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc      Logout user
// @route     GET /api/auth/logout
// @access    Private
export const logout = (req: Request, res: Response): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
export const getMe = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
}; 