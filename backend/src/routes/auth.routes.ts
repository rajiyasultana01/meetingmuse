import { Router } from 'express';
import { login, getCurrentUser, updateUserProfile } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateUser, getCurrentUser);
router.put('/profile', authenticateUser, updateUserProfile);

export default router;
