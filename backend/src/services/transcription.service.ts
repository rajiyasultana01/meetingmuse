import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';

// Fix DNS resolution issues by forcing Google DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.error('Failed to apply DNS fix in transcription service:', e);
}

const execAsync = promisify(exec);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300000, // 5 minutes timeout (increased from 60s)
  maxRetries: 3, // Retry 3 times on network errors
});

export interface TranscriptionResult {
  text: string;
  language?: string;
}

const extractAudioToMp3 = async (videoPath: string): Promise<string> => {
  const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

  try {
    console.log('Extracting audio from video...');

    // Find ffmpeg executable
    // Check if ffmpeg is in PATH, otherwise use local installation
    let ffmpegPath = 'ffmpeg';

    // Check for local ffmpeg installation in project root
    const localFfmpegPath = path.join(process.cwd(), '..', 'ffmpeg-8.0.1-essentials_build', 'bin', 'ffmpeg.exe');
    if (fs.existsSync(localFfmpegPath)) {
      ffmpegPath = `"${localFfmpegPath}"`;
      console.log('Using local FFmpeg:', localFfmpegPath);
    }

    // Use FFmpeg to extract audio and compress to MP3
    // -i: input file
    // -vn: no video
    // -ar 16000: sample rate 16kHz (good for speech)
    // -ac 1: mono audio
    // -b:a 32k: 32kbps bitrate (low quality but small file size)
    const command = `${ffmpegPath} -i "${videoPath}" -vn -ar 16000 -ac 1 -b:a 32k "${audioPath}" -y`;

    await execAsync(command);

    const audioStats = fs.statSync(audioPath);
    console.log(`Audio extracted: ${audioPath} (${(audioStats.size / (1024 * 1024)).toFixed(2)} MB)`);

    return audioPath;
  } catch (error: any) {
    console.error('Audio extraction error:', error);
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
};

export const convertVideoToMp4 = async (inputPath: string): Promise<string> => {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.mp4') {
    return inputPath; // Already MP4
  }

  const outputPath = inputPath.replace(ext, '.mp4');

  try {
    console.log(`Converting ${ext} video to MP4...`);

    let ffmpegPath = 'ffmpeg';
    // Check for local ffmpeg installation in project root
    const localFfmpegPath = path.join(process.cwd(), '..', 'ffmpeg-8.0.1-essentials_build', 'bin', 'ffmpeg.exe');
    if (fs.existsSync(localFfmpegPath)) {
      ffmpegPath = `"${localFfmpegPath}"`;
    }

    // Convert to compatible MP4 (H.264 + AAC)
    // -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart
    const command = `${ffmpegPath} -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y`;

    await execAsync(command);
    console.log('Conversion complete. New file:', outputPath);

    return outputPath;
  } catch (error: any) {
    console.error('Video conversion error:', error);
    // Return original path in case of failure, or throw?
    // Throwing is safer so we know it failed. But maybe we can proceed with webm?
    // If conversion fails, likely ffmpeg issue.
    throw new Error(`Failed to convert video: ${error.message}`);
  }
};

export const transcribeVideo = async (videoPath: string): Promise<TranscriptionResult> => {
  let audioPath: string | null = null;

  try {
    console.log('Starting transcription for:', videoPath);

    // Extract audio to MP3 to reduce file size
    audioPath = await extractAudioToMp3(videoPath);

    // Check file size
    const audioStats = fs.statSync(audioPath);
    const audioSizeMB = audioStats.size / (1024 * 1024);

    if (audioSizeMB > 25) {
      throw new Error(`Audio file too large (${audioSizeMB.toFixed(2)} MB). OpenAI limit is 25 MB.`);
    }

    const fileStream = fs.createReadStream(audioPath);

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    return {
      text: response.text,
      language: response.language || 'en',
    };
  } catch (error: any) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe video: ${error.message}`);
  } finally {
    // Clean up temporary audio file
    if (audioPath && fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
        console.log('Temporary audio file deleted');
      } catch (cleanupError) {
        console.warn('Failed to delete temporary audio file:', cleanupError);
      }
    }
  }
};

export const cleanTranscript = (rawTranscript: string): string => {
  let cleaned = rawTranscript;

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove common filler words
  cleaned = cleaned.replace(/\buh+\b/gi, '');
  cleaned = cleaned.replace(/\bum+\b/gi, '');
  cleaned = cleaned.replace(/\ber+\b/gi, '');
  cleaned = cleaned.replace(/\blike\b/gi, '');

  // Capitalize sentences
  cleaned = cleaned.replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());

  // Remove duplicate sentences
  const sentences = cleaned.split(/\.\s+/);
  const uniqueSentences = [...new Set(sentences)];
  cleaned = uniqueSentences.join('. ');

  return cleaned;
};
