import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getNotifications,
  markAllRead,
  deleteNotification,
  markAsRead,
} from '../controllers/notificationController';

const router = Router();
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id', markAsRead);
router.patch('/read-all', markAllRead);
router.delete('/:id', deleteNotification);

export default router;
