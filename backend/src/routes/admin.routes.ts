import { Router } from 'express';
import {
  getAllUsers,
  getAllMeetings,
  getAnalytics,
  updateUserRole,
} from '../controllers/admin.controller.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateUser, requireAdmin);

router.get('/users', getAllUsers);
router.get('/meetings', getAllMeetings);
router.get('/analytics', getAnalytics);
router.put('/users/:userId/role', updateUserRole);

export default router;
