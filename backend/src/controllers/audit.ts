import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AuditStatus, AuditCondition, AssetStatus } from '../utils/enums';

export const createAuditCycle = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { name, departmentId, location, startDate, endDate, auditorId } = req.body;

    if (!name || !startDate || !endDate || !auditorId) {
      return next(new AppError('Please provide name, startDate, endDate, and auditorId.', 400));
    }

    const cycle = await prisma.auditCycle.create({
      data: {
        name,
        departmentId: departmentId || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        auditorId,
        status: AuditStatus.DRAFT,
      },
    });

    return sendResponse(res, 201, 'Audit cycle created.', cycle);
  }
);

export const getAuditCycles = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const cycles = await prisma.auditCycle.findMany({
      include: {
        auditor: { select: { id: true, name: true, email: true } },
        results: {
          include: {
            asset: { select: { id: true, name: true, assetTag: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendResponse(res, 200, 'Audit cycles retrieved.', cycles);
  }
);

export const verifyAssetInAudit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { cycleId } = req.params;
    const { assetId, condition, notes } = req.body;

    if (!assetId || !condition) {
      return next(new AppError('Please provide assetId and condition.', 400));
    }

    const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
      return next(new AppError('Audit cycle not found.', 404));
    }

    if (cycle.status === AuditStatus.CLOSED) {
      return next(new AppError('This audit cycle is closed and locked.', 400));
    }

    // Upsert verification result
    const result = await prisma.auditAssetResult.upsert({
      where: {
        auditCycleId_assetId: {
          auditCycleId: cycleId,
          assetId,
        },
      },
      update: {
        condition: condition as AuditCondition,
        notes,
      },
      create: {
        auditCycleId: cycleId,
        assetId,
        condition: condition as AuditCondition,
        notes,
      },
    });

    // If marked damaged, we can also update asset condition directly
    if (condition === AuditCondition.DAMAGED) {
      await prisma.asset.update({
        where: { id: assetId },
        data: { condition: 'Poor' },
      });
    }

    return sendResponse(res, 200, 'Asset audited and recorded.', result);
  }
);

export const closeAuditCycle = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { cycleId } = req.params;

    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      return next(new AppError('Audit cycle not found.', 404));
    }

    if (cycle.status === AuditStatus.CLOSED) {
      return next(new AppError('Audit cycle is already closed.', 400));
    }

    // 1. Identify all assets in scope
    const scopeClause: any = {};
    if (cycle.departmentId) {
      scopeClause.departmentId = cycle.departmentId;
    }
    if (cycle.location) {
      scopeClause.location = { contains: cycle.location };
    }

    const scopedAssets = await prisma.asset.findMany({
      where: scopeClause,
    });

    // 2. Fetch existing results
    const results = await prisma.auditAssetResult.findMany({
      where: { auditCycleId: cycleId },
    });

    const resultsMap = new Map(results.map((r) => [r.assetId, r]));

    // 3. Generate Discrepancy Report & Update missing assets to LOST
    const discrepancies: any[] = [];
    const missingAssetIds: string[] = [];

    for (const asset of scopedAssets) {
      const auditResult = resultsMap.get(asset.id);

      if (!auditResult) {
        // Not checked at all -> Missing
        discrepancies.push({
          assetId: asset.id,
          name: asset.name,
          assetTag: asset.assetTag,
          issue: 'NOT_AUDITED (Presumed Missing)',
        });
        missingAssetIds.push(asset.id);
      } else if (auditResult.condition === AuditCondition.MISSING) {
        discrepancies.push({
          assetId: asset.id,
          name: asset.name,
          assetTag: asset.assetTag,
          issue: 'MARKED_MISSING',
          notes: auditResult.notes,
        });
        missingAssetIds.push(asset.id);
      } else if (auditResult.condition === AuditCondition.DAMAGED) {
        discrepancies.push({
          assetId: asset.id,
          name: asset.name,
          assetTag: asset.assetTag,
          issue: 'DAMAGED',
          notes: auditResult.notes,
        });
      }
    }

    // 4. Update status of missing assets to LOST in Transaction
    await prisma.$transaction([
      prisma.auditCycle.update({
        where: { id: cycleId },
        data: { status: AuditStatus.CLOSED },
      }),
      prisma.asset.updateMany({
        where: { id: { in: missingAssetIds } },
        data: { status: AssetStatus.LOST },
      }),
    ]);

    return sendResponse(res, 200, 'Audit cycle closed and locked. Discrepancy report compiled.', {
      discrepancyReport: discrepancies,
      discrepanciesCount: discrepancies.length,
    });
  }
);
