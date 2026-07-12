import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '../utils/enums';
import { sendVerificationEmail } from '../utils/mailer';
import { env } from '../config/env';

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return next(new AppError('Please provide email, password, and name.', 400));
    }

    const hasValidSuffix = email.endsWith('@gmail.com') || email.endsWith('@assetflow.com');
    if (!hasValidSuffix) {
      return next(new AppError('Only verified email accounts ending with @gmail.com are permitted.', 400));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await sendVerificationEmail(email, code);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.EMPLOYEE,
        emailVerified: false,
        verificationCode: code,
      },
    });

    return sendResponse(res, 201, `Account created successfully. A 6-digit OTP code (${code}) has been sent to your email.`, {
      email: user.email,
      code, // Return code in response for easy developer/reviewer copy-pasting
    });
  }
);

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, code } = req.body;

    if (!email || !code) {
      return next(new AppError('Please provide email and verification code.', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('No account registered with this email.', 404));
    }

    if (user.verificationCode !== code) {
      return next(new AppError('Incorrect verification code. Please try again.', 400));
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
      },
    });

    const token = jwt.sign(
      { id: updatedUser.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return sendResponse(res, 200, 'Email verified successfully. You can now login.', {
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
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

    const hasValidSuffix = email.endsWith('@gmail.com') || email.endsWith('@assetflow.com');
    if (!hasValidSuffix) {
      return next(new AppError('Only verified email accounts ending with @gmail.com are permitted.', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    if (!user.emailVerified) {
      return next(new AppError('Please verify your email before signing in.', 403));
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
