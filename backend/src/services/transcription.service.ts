import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  language?: string;
}

/**
 * Extracts audio from a video file and saves it as a temporary MP3 file.
 * Uses low bitrate to keep file size small for API limits.
 */
const extractAudio = (videoPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

    console.log(`Extracting audio from ${videoPath} to ${audioPath}...`);

    ffmpeg(videoPath)
      .toFormat('mp3')
      .audioBitrate('32k') // Low bitrate for speech is usually fine & saves space
      .audioChannels(1)    // Mono
      .on('end', () => {
        console.log('Audio extraction complete.');
        resolve(audioPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .save(audioPath);
  });
};

export const transcribeVideo = async (videoPath: string): Promise<TranscriptionResult> => {
  let audioPath: string | null = null;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing.");
    }

    // 1. Extract Audio
    audioPath = await extractAudio(videoPath);

    // 2. Transcribe with Groq
    console.log('Sending audio to Groq Whisper...');

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3",
      response_format: "json", // or "verbose_json" for timestamps
      temperature: 0.0,
    });

    console.log('Groq transcription complete.');

    return {
      text: transcription.text,
      language: 'en', // Groq auto-detects, but broadly we assume/enforce en usage context or could parse from verbose_json
    };

  } catch (error: any) {
    console.error('Groq Transcription Error:', error);
    throw new Error(`Groq Transcription failed: ${error.message}`);
  } finally {
    // Cleanup audio file
    if (audioPath && fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
      } catch (e) {
        console.warn('Failed to delete temp audio file:', e);
      }
    }
  }
};

export const cleanTranscript = (rawTranscript: string): string => {
  let cleaned = rawTranscript;
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\buh+\b/gi, '');
  cleaned = cleaned.replace(/\bum+\b/gi, '');
  cleaned = cleaned.replace(/\ber+\b/gi, '');
  cleaned = cleaned.replace(/\blike\b/gi, '');
  cleaned = cleaned.replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());
  const sentences = cleaned.split(/\.\s+/);
  const uniqueSentences = [...new Set(sentences)];
  cleaned = uniqueSentences.join('. ');
  return cleaned;
};
