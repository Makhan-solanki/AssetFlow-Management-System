import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { Role, UserStatus } from '@prisma/client';

// --- Departments ---
export const getDepartments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const departments = await prisma.department.findMany({
      include: {
        head: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true } },
      },
    });
    return sendResponse(res, 200, 'Departments retrieved.', departments);
  }
);

export const createDepartment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, headId, parentId } = req.body;

    if (!name) {
      return next(new AppError('Department name is required.', 400));
    }

    const dept = await prisma.department.create({
      data: {
        name,
        headId: headId || null,
        parentId: parentId || null,
      },
    });

    if (headId) {
      // Automatically promote/assign headId to DEPARTMENT_HEAD role
      await prisma.user.update({
        where: { id: headId },
        data: { role: Role.DEPARTMENT_HEAD, departmentId: dept.id },
      });
    }

    return sendResponse(res, 201, 'Department created.', dept);
  }
);

export const updateDepartment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, headId, parentId, status } = req.body;

    const deptExists = await prisma.department.findUnique({ where: { id } });
    if (!deptExists) {
      return next(new AppError('Department not found.', 404));
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name,
        headId: headId || null,
        parentId: parentId || null,
        status: status as UserStatus,
      },
    });

    if (headId && headId !== deptExists.headId) {
      await prisma.user.update({
        where: { id: headId },
        data: { role: Role.DEPARTMENT_HEAD, departmentId: id },
      });
    }

    return sendResponse(res, 200, 'Department updated.', updated);
  }
);

// --- Asset Categories ---
export const getCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await prisma.assetCategory.findMany();
    return sendResponse(res, 200, 'Categories retrieved.', categories);
  }
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, customFields } = req.body;

    if (!name) {
      return next(new AppError('Category name is required.', 400));
    }

    const category = await prisma.assetCategory.create({
      data: {
        name,
        customFields: customFields || [],
      },
    });
    return sendResponse(res, 201, 'Asset category created.', category);
  }
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, customFields } = req.body;

    const updated = await prisma.assetCategory.update({
      where: { id },
      data: {
        name,
        customFields,
      },
    });
    return sendResponse(res, 200, 'Asset category updated.', updated);
  }
);

// --- Employees Directory & Role promotion ---
export const getEmployees = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });
    return sendResponse(res, 200, 'Employee directory retrieved.', employees);
  }
);

export const updateEmployeeRoleOrDept = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { role, departmentId, status } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return next(new AppError('Employee not found.', 404));
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role as Role,
        departmentId: departmentId || null,
        status: status as UserStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
      },
    });

    return sendResponse(res, 200, 'Employee profile updated.', updated);
  }
);
