import { z } from 'zod';

export const registerAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  acquisitionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid acquisition date format',
  }),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']),
  location: z.string().min(1, 'Location is required'),
  isBookable: z.boolean().default(false),
  customValues: z.record(z.any()).optional().default({}),
});

export const updateAssetSchema = z.object({
  name: z.string().optional(),
  serialNumber: z.string().optional(),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']).optional(),
  location: z.string().optional(),
  isBookable: z.boolean().optional(),
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']).optional(),
  departmentId: z.string().uuid('Invalid department ID').nullable().optional(),
  customValues: z.record(z.any()).optional(),
});
