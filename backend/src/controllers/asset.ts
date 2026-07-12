import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { AssetStatus } from '@prisma/client';
import { cache } from '../config/redis';

export const getAssets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, categoryId, status, departmentId, location, isBookable } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { assetTag: { contains: String(search), mode: 'insensitive' } },
        { serialNumber: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = String(categoryId);
    }

    if (status) {
      whereClause.status = status as AssetStatus;
    }

    if (departmentId) {
      whereClause.departmentId = String(departmentId);
    }

    if (location) {
      whereClause.location = { contains: String(location), mode: 'insensitive' };
    }

    if (isBookable !== undefined) {
      whereClause.isBookable = isBookable === 'true';
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        category: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendResponse(res, 200, 'Assets retrieved successfully.', assets);
  }
);

export const getAssetById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        department: { select: { id: true, name: true } },
        allocations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            allocatedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        maintenanceRequests: {
          include: {
            reporter: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!asset) {
      return next(new AppError('Asset not found.', 404));
    }

    return sendResponse(res, 200, 'Asset retrieved.', asset);
  }
);

export const registerAsset = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      serialNumber,
      categoryId,
      acquisitionDate,
      acquisitionCost,
      condition,
      location,
      isBookable,
      customValues,
    } = req.body;

    if (!name || !serialNumber || !categoryId || !acquisitionDate || !acquisitionCost || !condition || !location) {
      return next(new AppError('Please provide all required fields.', 400));
    }

    // Check unique serial number
    const serialExists = await prisma.asset.findUnique({ where: { serialNumber } });
    if (serialExists) {
      return next(new AppError('Asset with this serial number already exists.', 409));
    }

    // Generate unique AssetTag
    const count = await prisma.asset.count();
    let assetTag = `AF-${String(count + 1).padStart(4, '0')}`;
    let isTagUnique = false;
    let attempts = 0;

    // Fallback collision resolution
    while (!isTagUnique && attempts < 10) {
      const tagExists = await prisma.asset.findUnique({ where: { assetTag } });
      if (!tagExists) {
        isTagUnique = true;
      } else {
        attempts++;
        assetTag = `AF-${String(count + 1 + attempts).padStart(4, '0')}`;
      }
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        serialNumber,
        assetTag,
        categoryId,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionCost: parseFloat(acquisitionCost),
        condition,
        location,
        isBookable: isBookable === true || isBookable === 'true',
        status: AssetStatus.AVAILABLE,
        customValues: customValues || {},
      },
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 201, 'Asset registered successfully.', asset);
  }
);

export const updateAsset = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      name,
      serialNumber,
      condition,
      location,
      isBookable,
      status,
      departmentId,
      customValues,
    } = req.body;

    const assetExists = await prisma.asset.findUnique({ where: { id } });
    if (!assetExists) {
      return next(new AppError('Asset not found.', 404));
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        name,
        serialNumber,
        condition,
        location,
        isBookable: isBookable !== undefined ? (isBookable === true || isBookable === 'true') : undefined,
        status: status as AssetStatus,
        departmentId: departmentId || null,
        customValues,
      },
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 200, 'Asset updated successfully.', updated);
  }
);

