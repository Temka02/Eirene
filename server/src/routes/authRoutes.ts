import { Router } from 'express';
import { register, login, logout, refresh, getMe } from '../controllers/authController';

const router = Router();
router.get('/me', getMe);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

export default router;
