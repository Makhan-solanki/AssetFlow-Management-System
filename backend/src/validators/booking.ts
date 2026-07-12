import { z } from 'zod';

export const bookingSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time format',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end time format',
  }),
  notes: z.string().optional(),
});
