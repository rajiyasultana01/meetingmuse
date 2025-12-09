import { Router, Request, Response } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
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
  userId?: string; // Optional in body, we get it from token
  externalId?: string;
  metadata?: {
    duration?: number;
    participants?: string[];
    [key: string]: any;
  };
}

router.post(
  '/receive-recording',
  authenticateUser,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        video,
        videoUrl,
        fileName,
        title,
        description,
        externalId,
        metadata,
      }: ExternalRecordingRequest = req.body;

      const userId = req.user!.uid; // Trusted from token

      // Validate request
      if (!video && !videoUrl) {
        res.status(400).json({ error: 'Either video or videoUrl is required' });
        return;
      }

      if (!fileName) {
        res.status(400).json({ error: 'fileName is required' });
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

      // Upload to Firebase with fallback
      const firebasePath = `meetings/${user.firebaseUid}/external-${externalId || Date.now()}-${fileName}`;
      let firebaseUrl: string;
      let storagePath: string = firebasePath; // Default to firebase path pattern
      let uploadStatus = 'uploaded';

      try {
        firebaseUrl = await uploadToFirebase(localPath, firebasePath);
      } catch (uploadError) {
        console.error('Firebase upload failed, falling back to local storage:', uploadError);
        // Fallback: Use local file URL
        // Assuming backend serves 'uploads' folder statically
        const relativePath = path.relative(process.cwd(), localPath);
        firebaseUrl = `http://localhost:5000/${relativePath.replace(/\\/g, '/')}`; // Convert windoes path
        storagePath = localPath;
        uploadStatus = 'processing'; // Use a valid status enum
      }

      // Create meeting record
      const meeting = await Meeting.create({
        userId: user._id,
        firebaseUid: user.firebaseUid,
        title: title || fileName.replace(/\.[^/.]+$/, ''),
        description: description || `External recording${externalId ? ` (ID: ${externalId})` : ''}`,
        videoPath: storagePath,
        videoUrl: firebaseUrl,
        source: 'chrome-extension', // From Chrome extension
        status: uploadStatus,
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
