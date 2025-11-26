import { Router } from 'express';
import {
  uploadMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
} from '../controllers/meeting.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/upload', authenticateUser, upload.single('video'), uploadMeeting);
router.get('/', authenticateUser, getMeetings);
router.get('/:id', authenticateUser, getMeetingById);
router.delete('/:id', authenticateUser, deleteMeeting);

export default router;
