import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeeting extends Document {
  userId: Types.ObjectId;
  firebaseUid: string;
  title: string;
  description?: string;
  videoPath: string;
  videoUrl: string;
  thumbnailUrl?: string;
  source: 'chrome-extension' | 'manual-upload';
  status: 'uploaded' | 'processing' | 'transcribing' | 'summarizing' | 'completed' | 'failed';
  errorMessage?: string;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    videoPath: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    source: {
      type: String,
      enum: ['chrome-extension', 'manual-upload'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'transcribing', 'summarizing', 'completed', 'failed'],
      default: 'uploaded',
      index: true,
    },
    errorMessage: {
      type: String,
    },
    durationSeconds: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
