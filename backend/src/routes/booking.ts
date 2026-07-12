import { Router } from 'express';
import { getBookings, createBooking, cancelBooking } from '../controllers/booking';
import { requireAuth } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { bookingSchema } from '../validators/booking';

const router = Router();

router.get('/', requireAuth, getBookings);
router.post('/', requireAuth, validateBody(bookingSchema), createBooking);
router.put('/:id/cancel', requireAuth, cancelBooking);

export default router;

