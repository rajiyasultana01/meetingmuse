import Express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Meeting } from '../models/Meeting.js';
import { Transcript } from '../models/Transcript.js';
import { Summary } from '../models/Summary.js';
import { MeetingAnalytics } from '../models/MeetingAnalytics.js';
import { User } from '../models/User.js';
import { uploadToFirebase } from '../services/storage.service.js';
import { processMeetingVideo } from '../services/meeting.service.js';

export const uploadMeeting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const { title, description } = req.body;
    const localPath = req.file.path;

    // Get user from database
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Temporarily skip Firebase Storage - use local path
    const firebasePath = `meetings/${user.firebaseUid}/${Date.now()}-${req.file.filename}`;
    // const videoUrl = await uploadToFirebase(localPath, firebasePath);
    const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`; // Temporary local URL

    // Create meeting record
    const meeting = await Meeting.create({
      userId: user._id,
      firebaseUid: user.firebaseUid,
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      description: description || '',
      videoPath: localPath, // Use local path instead
      videoUrl,
      source: 'manual-upload', // Manual video upload
      status: 'uploaded',
    });

    // Start processing in background
    processMeetingVideo(meeting._id.toString(), localPath).catch((error) => {
      console.error('Background processing error:', error);
    });

    res.status(201).json({
      id: meeting._id,
      title: meeting.title,
      status: meeting.status,
      videoUrl: meeting.videoUrl,
      message: 'Meeting uploaded successfully. Processing started.',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const uploadMeetingFromExtension = async (
  req: Express.Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const { title } = req.body;
    const localPath = req.file.path;

    // Find the first admin user to assign the meeting to
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      res.status(404).json({ error: 'No admin user found to assign meeting' });
      return;
    }

    const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Create meeting record
    const meeting = await Meeting.create({
      userId: adminUser._id,
      firebaseUid: adminUser.firebaseUid,
      title: title || `Extension Recording ${new Date().toLocaleString()}`,
      description: 'Automatically uploaded from LexEye extension',
      videoPath: localPath,
      videoUrl,
      source: 'chrome-extension',
      status: 'uploaded',
    });

    // Start processing in background
    processMeetingVideo(meeting._id.toString(), localPath).catch((error) => {
      console.error('Background processing error:', error);
    });

    res.status(201).json({
      id: meeting._id,
      title: meeting.title,
      status: meeting.status,
      message: 'Meeting uploaded successfully from extension.',
    });
  } catch (error: any) {
    console.error('Extension upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const uploadMeetingFromExtensionAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const { title } = req.body;
    const localPath = req.file.path;

    // Get user from database (authenticated via Firebase token)
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Create meeting record assigned to the authenticated user
    const meeting = await Meeting.create({
      userId: user._id,
      firebaseUid: user.firebaseUid,
      title: title || `Extension Recording ${new Date().toLocaleString()}`,
      description: 'Automatically uploaded from LexEye extension',
      videoPath: localPath,
      videoUrl,
      source: 'chrome-extension',
      status: 'uploaded',
    });

    // Start processing in background
    processMeetingVideo(meeting._id.toString(), localPath).catch((error) => {
      console.error('Background processing error:', error);
    });

    res.status(201).json({
      id: meeting._id,
      title: meeting.title,
      status: meeting.status,
      message: 'Meeting uploaded successfully from extension.',
    });
  } catch (error: any) {
    console.error('Extension upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMeetings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { status, source, limit = 20, offset = 0 } = req.query;

    const query: any = { userId: user._id };
    if (status) {
      query.status = status;
    }
    if (source) {
      query.source = source;
    }

    const meetings = await Meeting.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMeetingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ firebaseUid: req.user?.uid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const meeting = await Meeting.findOne({
      _id: id,
      userId: user._id,
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    // Get transcript and summary if available
    const transcript = await Transcript.findOne({ meetingId: meeting._id });
    const summary = await Summary.findOne({ meetingId: meeting._id });
    const analytics = await MeetingAnalytics.findOne({ meetingId: meeting._id });

    // Update analytics
    if (analytics) {
      analytics.viewCount += 1;
      analytics.lastViewedAt = new Date();
      await analytics.save();
    }

    res.json({
      meeting,
      transcript: transcript
        ? {
          rawTranscript: transcript.rawTranscript,
          cleanedTranscript: transcript.cleanedTranscript,
          language: transcript.language,
          wordCount: transcript.wordCount,
        }
        : null,
      summary: summary
        ? {
          summaryText: summary.summaryText,
          keyPoints: summary.keyPoints,
          actionItems: summary.actionItems,
          topics: summary.topics,
          participants: summary.participants,
          sentiment: summary.sentiment,
        }
        : null,
      analytics: analytics
        ? {
          viewCount: analytics.viewCount,
          shareCount: analytics.shareCount,
          downloadCount: analytics.downloadCount,
        }
        : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeeting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ firebaseUid: req.user?.uid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const meeting = await Meeting.findOne({
      _id: id,
      userId: user._id,
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    // Delete associated records
    await Transcript.deleteOne({ meetingId: meeting._id });
    await Summary.deleteOne({ meetingId: meeting._id });
    await MeetingAnalytics.deleteOne({ meetingId: meeting._id });
    await Meeting.deleteOne({ _id: meeting._id });

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
