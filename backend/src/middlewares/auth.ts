import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { Role } from '../utils/enums';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: Role;
    departmentId: string | null;
  };
}

export const requireAuth = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to gain access.', 401));
    }

    try {
      const decoded = jwt.verify(
        token,
        env.JWT_SECRET
      ) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          departmentId: true,
        },
      });

      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      if (user.status === 'INACTIVE') {
        return next(new AppError('This user account has been deactivated.', 403));
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        departmentId: user.departmentId,
      };
      next();
    } catch (err) {
      return next(new AppError('Invalid token or token expired.', 401));
    }
  }
);

export const requireRoles = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};
