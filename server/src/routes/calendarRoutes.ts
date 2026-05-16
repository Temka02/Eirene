import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getCalendarData } from '../controllers/calendarController';

const router = Router();
router.use(protect);
router.get('/', getCalendarData);

export default router;
