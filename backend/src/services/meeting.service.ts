import path from 'path';
import { Meeting } from '../models/Meeting.js';
import { Transcript } from '../models/Transcript.js';
import { Summary } from '../models/Summary.js';
import { MeetingAnalytics } from '../models/MeetingAnalytics.js';
import { transcribeVideo, cleanTranscript, convertVideoToMp4 } from './transcription.service.js';
import { generateSummary } from './summarization.service.js';
import { uploadToFirebase, deleteLocalFile } from './storage.service.js';

export const processMeetingVideo = async (
  meetingId: string,
  localVideoPath: string
): Promise<void> => {
  try {
    console.log(`Processing meeting ${meetingId}`);

    // Update status to transcribing
    await Meeting.findByIdAndUpdate(meetingId, {
      status: 'transcribing',
    });

    // Step 0: Ensure video is MP4
    const finalVideoPath = await convertVideoToMp4(localVideoPath);

    // If file was converted, update the Meeting URL
    if (finalVideoPath !== localVideoPath) {
      const meeting = await Meeting.findById(meetingId);
      if (meeting && meeting.videoUrl) {
        const oldExt = path.extname(meeting.videoUrl);
        const newUrl = meeting.videoUrl.replace(oldExt, '.mp4');
        await Meeting.findByIdAndUpdate(meetingId, { videoUrl: newUrl });
        console.log(`Updated video URL to ${newUrl}`);
      }
    }

    // Step 1: Transcribe video (using final path)
    const transcriptionResult = await transcribeVideo(finalVideoPath);

    // Step 2: Save raw transcript
    const transcript = await Transcript.create({
      meetingId,
      rawTranscript: transcriptionResult.text,
      language: transcriptionResult.language || 'en',
      wordCount: transcriptionResult.text.split(/\s+/).length,
    });

    // Step 3: Clean transcript
    const cleanedTranscript = cleanTranscript(transcriptionResult.text);
    await Transcript.findByIdAndUpdate(transcript._id, {
      cleanedTranscript,
    });

    // Update status to summarizing
    await Meeting.findByIdAndUpdate(meetingId, {
      status: 'summarizing',
    });

    // Step 4: Generate summary
    const summaryResult = await generateSummary(cleanedTranscript);

    // Step 5: Save summary
    await Summary.create({
      meetingId,
      transcriptId: transcript._id,
      summaryText: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
      actionItems: summaryResult.actionItems,
      topics: summaryResult.topics,
      participants: summaryResult.participants || [],
      sentiment: summaryResult.sentiment || 'neutral',
    });

    // Step 6: Create analytics record
    const meeting = await Meeting.findById(meetingId);
    if (meeting) {
      await MeetingAnalytics.create({
        meetingId,
        userId: meeting.userId,
        viewCount: 0,
        shareCount: 0,
        downloadCount: 0,
      });
    }

    // Step 7: Mark as completed
    await Meeting.findByIdAndUpdate(meetingId, {
      status: 'completed',
    });

    // Don't delete local file - we're using it instead of Firebase Storage
    // deleteLocalFile(localVideoPath);

    console.log(`Meeting ${meetingId} processed successfully`);
  } catch (error: any) {
    console.error(`Error processing meeting ${meetingId}:`, error);

    // Mark meeting as failed
    await Meeting.findByIdAndUpdate(meetingId, {
      status: 'failed',
      errorMessage: error.message,
    });

    // Don't delete local file on error either
    // deleteLocalFile(localVideoPath);

    throw error;
  }
};
