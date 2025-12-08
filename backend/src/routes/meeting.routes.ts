import { Router } from 'express';
import {
  uploadMeeting,
  uploadMeetingFromExtension,
  uploadMeetingFromExtensionAuth,
  getMeetings,
  getMeetingById,
  deleteMeeting,
} from '../controllers/meeting.controller.js';
import { authenticateUser, verifyApiKey } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/upload', authenticateUser, upload.single('video'), uploadMeeting);
router.post('/upload-extension', verifyApiKey, upload.single('video'), uploadMeetingFromExtension);
router.post('/upload-extension-auth', authenticateUser, upload.single('video'), uploadMeetingFromExtensionAuth);
router.get('/', authenticateUser, getMeetings);
router.get('/:id', authenticateUser, getMeetingById);
router.delete('/:id', authenticateUser, deleteMeeting);

export default router;
