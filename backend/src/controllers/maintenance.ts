import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth';
import { MaintenanceStatus, AssetStatus } from '@prisma/client';
import { cache } from '../config/redis';

export const getMaintenanceRequests = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { id: true, name: true, assetTag: true, serialNumber: true, status: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendResponse(res, 200, 'Maintenance requests retrieved.', requests);
  }
);

export const raiseRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { assetId, description, priority } = req.body;

    if (!assetId || !description || !priority) {
      return next(new AppError('Please provide assetId, description, and priority.', 400));
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return next(new AppError('Asset not found.', 404));
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        reporterId: req.user!.id,
        description,
        priority,
        status: MaintenanceStatus.PENDING,
      },
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 201, 'Maintenance request submitted.', request);
  }
);

export const updateMaintenanceStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, technicianAssigned, resolutionNotes } = req.body;

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return next(new AppError('Maintenance ticket not found.', 404));
    }

    const nextStatus = status as MaintenanceStatus;

    // Execute state changes and auto-update asset status
    const updated = await prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: nextStatus,
          technicianAssigned: technicianAssigned !== undefined ? technicianAssigned : undefined,
          resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : undefined,
        },
      });

      // Auto update asset status based on workflow status
      if (nextStatus === MaintenanceStatus.APPROVED || nextStatus === MaintenanceStatus.TECHNICIAN_ASSIGNED || nextStatus === MaintenanceStatus.IN_PROGRESS) {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: AssetStatus.UNDER_MAINTENANCE },
        });
      } else if (nextStatus === MaintenanceStatus.RESOLVED) {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: AssetStatus.AVAILABLE },
        });
      } else if (nextStatus === MaintenanceStatus.REJECTED) {
        // If rejected, set it back to AVAILABLE if it was set to UNDER_MAINTENANCE (usually remains AVAILABLE anyway since it was pending)
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: AssetStatus.AVAILABLE },
        });
      }

      return ticket;
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 200, 'Maintenance workflow status updated.', updated);
  }
);

