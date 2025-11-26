import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeetingAnalytics extends Document {
  meetingId: Types.ObjectId;
  userId: Types.ObjectId;
  viewCount: number;
  shareCount: number;
  downloadCount: number;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingAnalyticsSchema = new Schema<IMeetingAnalytics>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const MeetingAnalytics = mongoose.model<IMeetingAnalytics>('MeetingAnalytics', MeetingAnalyticsSchema);
