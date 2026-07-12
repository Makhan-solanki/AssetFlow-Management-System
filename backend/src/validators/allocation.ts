import { z } from 'zod';

export const allocateAssetSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  userId: z.string().uuid('Invalid user ID'),
  expectedReturnDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid return date format',
  }).optional(),
  notes: z.string().optional(),
});

export const transferAssetSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  targetUserId: z.string().uuid('Invalid target user ID'),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']).optional(),
  notes: z.string().optional(),
});
