import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';
import { env } from '../config/env';

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return next(new AppError('Please provide email, password, and name.', 400));
    }

    // Verify @gmail.com or @assetflow.com suffix
    const hasValidSuffix = email.endsWith('@gmail.com') || email.endsWith('@assetflow.com');
    if (!hasValidSuffix) {
      return next(new AppError('Only verified email accounts ending with @gmail.com are permitted.', 400));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.EMPLOYEE, // Always default to EMPLOYEE at signup
      },
    });

    const token = jwt.sign(
      { id: user.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return sendResponse(res, 201, 'Account created successfully. Default role: EMPLOYEE.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    // Verify suffix during login
    const hasValidSuffix = email.endsWith('@gmail.com') || email.endsWith('@assetflow.com');
    if (!hasValidSuffix) {
      return next(new AppError('Only verified email accounts ending with @gmail.com are permitted.', 400));
    }

    console.log('🔍 Login attempt:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('❌ User not found in database:', email);
      return next(new AppError('Incorrect email or password.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match status:', isMatch);
    if (!isMatch) {
      console.log('❌ Password verification failed for:', email);
      return next(new AppError('Incorrect email or password.', 401));
    }

    if (user.status === 'INACTIVE') {
      return next(new AppError('This account is deactivated. Please contact support.', 403));
    }

    const token = jwt.sign(
      { id: user.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return sendResponse(res, 200, 'Login successful.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
    });
  }
);


export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }
    return sendResponse(res, 200, 'User profile retrieved.', req.user);
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new AppError('Please provide email and your new password.', 400));
    }

    const hasValidSuffix = email.endsWith('@gmail.com') || email.endsWith('@assetflow.com');
    if (!hasValidSuffix) {
      return next(new AppError('Only verified email accounts ending with @gmail.com are permitted.', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('No account registered with this email.', 404));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return sendResponse(res, 200, 'Password has been reset successfully. You can now login with your new password.');
  }
);

