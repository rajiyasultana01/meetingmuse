import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISummary extends Document {
  meetingId: Types.ObjectId;
  transcriptId: Types.ObjectId;
  summaryText: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  participants: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema = new Schema<ISummary>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
      index: true,
    },
    transcriptId: {
      type: Schema.Types.ObjectId,
      ref: 'Transcript',
      required: true,
    },
    summaryText: {
      type: String,
      required: true,
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    actionItems: {
      type: [String],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    participants: {
      type: [String],
      default: [],
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
  },
  {
    timestamps: true,
  }
);

export const Summary = mongoose.model<ISummary>('Summary', SummarySchema);
