import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITranscript extends Document {
  meetingId: Types.ObjectId;
  rawTranscript: string;
  cleanedTranscript?: string;
  language: string;
  confidenceScore?: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSchema = new Schema<ITranscript>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
      index: true,
    },
    rawTranscript: {
      type: String,
      required: true,
    },
    cleanedTranscript: {
      type: String,
    },
    language: {
      type: String,
      default: 'en',
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    wordCount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transcript = mongoose.model<ITranscript>('Transcript', TranscriptSchema);
