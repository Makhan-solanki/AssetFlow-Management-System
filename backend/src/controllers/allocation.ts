import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AssetStatus, AllocationStatus, TransferStatus } from '../utils/enums';
import { cache } from '../config/redis';

// 1. Allocate Asset
export const allocateAsset = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { assetId, userId, expectedReturnDate, notes } = req.body;

    if (!assetId || !userId) {
      return next(new AppError('Please provide assetId and userId.', 400));
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        allocations: {
          where: { status: AllocationStatus.ALLOCATED },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!asset) {
      return next(new AppError('Asset not found.', 404));
    }

    // Conflict detection
    if (asset.status !== AssetStatus.AVAILABLE) {
      const activeAlloc = asset.allocations[0];
      const holderName = activeAlloc?.user?.name || 'an employee';
      
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Conflict: Asset is already allocated. Currently held by ${holderName}.`,
        holderName,
        activeAllocationId: activeAlloc?.id || null,
      });
    }

    // Get Target User Department
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });

    if (!targetUser) {
      return next(new AppError('Target employee not found.', 404));
    }

    // Create Allocation
    const allocation = await prisma.assetAllocation.create({
      data: {
        assetId,
        userId,
        departmentId: targetUser.departmentId,
        allocatedById: req.user!.id,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
        notes,
        status: AllocationStatus.ALLOCATED,
      },
    });

    // Update Asset Status
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: AssetStatus.ALLOCATED,
        departmentId: targetUser.departmentId,
      },
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 201, 'Asset allocated successfully.', allocation);
  }
);

// 2. Return Asset
export const returnAsset = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params; // allocation id
    const { condition, notes } = req.body;

    const allocation = await prisma.assetAllocation.findUnique({
      where: { id },
    });

    if (!allocation || allocation.status !== AllocationStatus.ALLOCATED) {
      return next(new AppError('Active allocation not found or already returned.', 404));
    }

    // Update Allocation
    const updatedAlloc = await prisma.assetAllocation.update({
      where: { id },
      data: {
        status: AllocationStatus.RETURNED,
        actualReturnDate: new Date(),
        notes: notes ? `${allocation.notes || ''}\nCheck-in notes: ${notes}` : allocation.notes,
      },
    });

    // Update Asset
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: {
        status: AssetStatus.AVAILABLE,
        condition: condition || undefined,
        departmentId: null,
      },
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 200, 'Asset returned and marked as Available.', updatedAlloc);
  }
);

// 3. Get Allocations
export const getAllocations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const allocations = await prisma.assetAllocation.findMany({
      include: {
        asset: { select: { id: true, name: true, assetTag: true, serialNumber: true } },
        user: { select: { id: true, name: true, email: true } },
        allocatedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Dynamically flag overdue allocations
    const now = new Date();
    const mapped = allocations.map((alloc) => {
      const isOverdue =
        alloc.status === AllocationStatus.ALLOCATED &&
        alloc.expectedReturnDate &&
        new Date(alloc.expectedReturnDate) < now;
      return {
        ...alloc,
        isOverdue: !!isOverdue,
      };
    });

    return sendResponse(res, 200, 'Allocations retrieved.', mapped);
  }
);

// 4. Request Transfer
export const requestTransfer = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { assetId, targetUserId, notes } = req.body;

    if (!assetId || !targetUserId) {
      return next(new AppError('Please provide assetId and targetUserId.', 400));
    }

    // Find current active allocation
    const activeAlloc = await prisma.assetAllocation.findFirst({
      where: {
        assetId,
        status: AllocationStatus.ALLOCATED,
      },
    });

    if (!activeAlloc) {
      return next(new AppError('Asset is not currently allocated to anyone.', 400));
    }

    if (activeAlloc.userId === targetUserId) {
      return next(new AppError('Asset is already allocated to this user.', 400));
    }

    const transfer = await prisma.transferRequest.create({
      data: {
        assetId,
        sourceUserId: activeAlloc.userId,
        targetUserId,
        requestedById: req.user!.id,
        notes,
        status: TransferStatus.PENDING,
      },
    });

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 201, 'Transfer request submitted.', transfer);
  }
);

// 5. Handle Transfer (Approve/Reject)
export const handleTransfer = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return next(new AppError('Action must be APPROVE or REJECT.', 400));
    }

    const transfer = await prisma.transferRequest.findUnique({
      where: { id },
    });

    if (!transfer || transfer.status !== TransferStatus.PENDING) {
      return next(new AppError('Pending transfer request not found.', 404));
    }

    if (action === 'REJECT') {
      const updated = await prisma.transferRequest.update({
        where: { id },
        data: {
          status: TransferStatus.REJECTED,
          approvedById: req.user!.id,
        },
      });
      return sendResponse(res, 200, 'Transfer request rejected.', updated);
    }

    // Approve: Update old allocation, create new allocation, update asset
    const targetUser = await prisma.user.findUnique({
      where: { id: transfer.targetUserId },
    });

    if (!targetUser) {
      return next(new AppError('Target user not found.', 404));
    }

    // Transaction
    const [updatedTransfer, oldAlloc, newAlloc] = await prisma.$transaction([
      prisma.transferRequest.update({
        where: { id },
        data: {
          status: TransferStatus.APPROVED,
          approvedById: req.user!.id,
        },
      }),
      prisma.assetAllocation.updateMany({
        where: {
          assetId: transfer.assetId,
          userId: transfer.sourceUserId,
          status: AllocationStatus.ALLOCATED,
        },
        data: {
          status: AllocationStatus.RETURNED,
          actualReturnDate: new Date(),
        },
      }),
      prisma.assetAllocation.create({
        data: {
          assetId: transfer.assetId,
          userId: transfer.targetUserId,
          departmentId: targetUser.departmentId,
          allocatedById: req.user!.id,
          notes: `Transferred. Source user request: ${transfer.notes || ''}`,
          status: AllocationStatus.ALLOCATED,
        },
      }),
      prisma.asset.update({
        where: { id: transfer.assetId },
        data: {
          departmentId: targetUser.departmentId,
        },
      }),
    ]);

    // Invalidate dashboard stats cache
    await cache.del('dashboard:stats');

    return sendResponse(res, 200, 'Transfer request approved and asset reallocated.', {
      transfer: updatedTransfer,
      newAllocation: newAlloc,
    });
  }
);

// 6. Get Transfers
export const getTransfers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const transfers = await prisma.transferRequest.findMany({
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        sourceUser: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendResponse(res, 200, 'Transfers retrieved.', transfers);
  }
);

