import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { MeetingAnalytics } from '../models/MeetingAnalytics.js';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await User.countDocuments();

    res.json({
      users,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMeetings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('userId', 'email displayName')
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

export const getAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMeetings = await Meeting.countDocuments();
    const completedMeetings = await Meeting.countDocuments({ status: 'completed' });
    const failedMeetings = await Meeting.countDocuments({ status: 'failed' });

    const analytics = await MeetingAnalytics.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalShares: { $sum: '$shareCount' },
          totalDownloads: { $sum: '$downloadCount' },
        },
      },
    ]);

    res.json({
      users: {
        total: totalUsers,
      },
      meetings: {
        total: totalMeetings,
        completed: completedMeetings,
        failed: failedMeetings,
        processing: totalMeetings - completedMeetings - failedMeetings,
      },
      analytics: analytics[0] || {
        totalViews: 0,
        totalShares: 0,
        totalDownloads: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User role updated', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
