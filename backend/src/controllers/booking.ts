import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth';
import { BookingStatus, AssetStatus } from '@prisma/client';

export const getBookings = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { assetId } = req.query;

    const bookings = await prisma.resourceBooking.findMany({
      where: assetId ? { assetId: String(assetId) } : {},
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return sendResponse(res, 200, 'Bookings retrieved.', bookings);
  }
);

export const createBooking = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { assetId, startTime, endTime, notes } = req.body;

    if (!assetId || !startTime || !endTime) {
      return next(new AppError('Please provide assetId, startTime, and endTime.', 400));
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return next(new AppError('Start time must be before end time.', 400));
    }

    // Verify asset exists and is bookable
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return next(new AppError('Asset not found.', 404));
    }

    if (!asset.isBookable) {
      return next(new AppError('This asset is not marked as bookable/shared resource.', 400));
    }

    if (asset.status === AssetStatus.LOST || asset.status === AssetStatus.RETIRED || asset.status === AssetStatus.DISPOSED) {
      return next(new AppError('This asset is not active or available for bookings.', 400));
    }

    // Check overlap
    const overlap = await prisma.resourceBooking.findFirst({
      where: {
        assetId,
        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        overlap: true,
        message: `Booking conflict: Timeslot overlaps with booking by ${overlap.user.name}.`,
        conflictingBooking: overlap,
      });
    }

    // Create Booking
    const booking = await prisma.resourceBooking.create({
      data: {
        assetId,
        userId: req.user!.id,
        startTime: start,
        endTime: end,
        notes,
        status: BookingStatus.UPCOMING,
      },
    });

    return sendResponse(res, 201, 'Booking confirmed.', booking);
  }
);

export const cancelBooking = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const booking = await prisma.resourceBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Check permissions (Only creator, Asset Manager, or Admin can cancel)
    if (
      booking.userId !== req.user!.id &&
      req.user!.role !== 'ADMIN' &&
      req.user!.role !== 'ASSET_MANAGER'
    ) {
      return next(new AppError('You do not have permission to cancel this booking.', 403));
    }

    const updated = await prisma.resourceBooking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return sendResponse(res, 200, 'Booking cancelled successfully.', updated);
  }
);
