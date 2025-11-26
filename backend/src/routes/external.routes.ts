import { Router, Request, Response } from 'express';
import { verifyApiKey } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { uploadToFirebase } from '../services/storage.service.js';
import { processMeetingVideo } from '../services/meeting.service.js';
import fs from 'fs';
import path from 'path';

const router = Router();

interface ExternalRecordingRequest {
  video?: string; // base64 encoded
  videoUrl?: string;
  fileName: string;
  title?: string;
  description?: string;
  userId: string; // Firebase UID
  externalId?: string;
  metadata?: {
    duration?: number;
    participants?: string[];
    [key: string]: any;
  };
}

router.post(
  '/receive-recording',
  verifyApiKey,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        video,
        videoUrl,
        fileName,
        title,
        description,
        userId,
        externalId,
        metadata,
      }: ExternalRecordingRequest = req.body;

      // Validate request
      if (!video && !videoUrl) {
        res.status(400).json({ error: 'Either video or videoUrl is required' });
        return;
      }

      if (!fileName) {
        res.status(400).json({ error: 'fileName is required' });
        return;
      }

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      // Get user from database
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        res.status(404).json({ error: `User not found: ${userId}` });
        return;
      }

      // Process video data
      let localPath: string;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';

      if (video) {
        // Base64 encoded video
        const buffer = Buffer.from(video, 'base64');
        const ext = path.extname(fileName) || '.mp4';
        const localFileName = `external-${Date.now()}${ext}`;
        localPath = path.join(uploadDir, localFileName);
        fs.writeFileSync(localPath, buffer);
      } else if (videoUrl) {
        // Download from URL
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video from URL: ${videoUrl}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = path.extname(fileName) || '.mp4';
        const localFileName = `external-${Date.now()}${ext}`;
        localPath = path.join(uploadDir, localFileName);
        fs.writeFileSync(localPath, buffer);
      } else {
        res.status(400).json({ error: 'No video data provided' });
        return;
      }

      // Upload to Firebase
      const firebasePath = `meetings/${user.firebaseUid}/external-${externalId || Date.now()}-${fileName}`;
      const firebaseUrl = await uploadToFirebase(localPath, firebasePath);

      // Create meeting record
      const meeting = await Meeting.create({
        userId: user._id,
        firebaseUid: user.firebaseUid,
        title: title || fileName.replace(/\.[^/.]+$/, ''),
        description: description || `External recording${externalId ? ` (ID: ${externalId})` : ''}`,
        videoPath: firebasePath,
        videoUrl: firebaseUrl,
        status: 'uploaded',
        durationSeconds: metadata?.duration,
      });

      // Start processing in background
      processMeetingVideo(meeting._id.toString(), localPath).catch((error) => {
        console.error('Background processing error:', error);
      });

      res.status(200).json({
        success: true,
        meetingId: meeting._id,
        message: 'Recording received and processing started',
        status: 'processing',
      });
    } catch (error: any) {
      console.error('External recording error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
