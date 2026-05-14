import { Router } from 'express';
import { register, login, logout, refresh, getMe, updateMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();
router.get('/me', getMe);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.put('/me', protect, updateMe);
router.post('/refresh', refresh);

export default router;
