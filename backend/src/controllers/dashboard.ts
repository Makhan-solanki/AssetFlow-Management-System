import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AssetStatus, BookingStatus, AllocationStatus, TransferStatus } from '@prisma/client';
import { cache } from '../config/redis';

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = 'dashboard:stats';
    const cachedStats = await cache.get(cacheKey);

    if (cachedStats) {
      return sendResponse(res, 200, 'Dashboard statistics compiled successfully (cached).', JSON.parse(cachedStats));
    }

    const now = new Date();

    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      activeBookings,
      pendingTransfers,
      maintenanceCount,
      allAllocations,
    ] = await prisma.$transaction([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      prisma.asset.count({ where: { status: AssetStatus.ALLOCATED } }),
      prisma.resourceBooking.count({
        where: {
          status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
        },
      }),
      prisma.transferRequest.count({
        where: { status: TransferStatus.PENDING },
      }),
      prisma.maintenanceRequest.count({
        where: {
          status: { notIn: ['RESOLVED', 'REJECTED'] },
        },
      }),
      // Query allocations to count overdue returns
      prisma.assetAllocation.findMany({
        where: { status: AllocationStatus.ALLOCATED },
        select: { expectedReturnDate: true },
      }),
    ]);

    const overdueCount = allAllocations.filter(
      (a) => a.expectedReturnDate && new Date(a.expectedReturnDate) < now
    ).length;

    const statsData = {
      totalAssets,
      availableAssets,
      allocatedAssets,
      activeBookings,
      pendingTransfers,
      maintenanceCount,
      overdueCount,
    };

    // Cache dashboard stats for 60 seconds
    await cache.set(cacheKey, JSON.stringify(statsData), 60);

    return sendResponse(res, 200, 'Dashboard statistics compiled successfully.', statsData);
  }
);

