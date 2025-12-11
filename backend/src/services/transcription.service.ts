import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dns from 'dns';
import ffmpegStatic from 'ffmpeg-static';

// Fix DNS resolution issues by forcing Google DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.error('Failed to apply DNS fix in transcription service:', e);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300000, // 5 minutes timeout
  maxRetries: 3,
});

export interface TranscriptionResult {
  text: string;
  language?: string;
}

// Memory-safe spawn wrapper to replace exec
const runCommand = (command: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Spawning command: ${command} ${args.join(' ')}`);
    const child = spawn(command, args);

    child.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`); // Disable logging to save memory
    });

    child.stderr.on('data', (data) => {
      // console.error(`stderr: ${data}`); // Disable logging to save memory
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};

const extractAudioToMp3 = async (videoPath: string): Promise<string> => {
  const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

  try {
    console.log('Extracting audio from video...');

    let ffmpegPath = ffmpegStatic || 'ffmpeg';
    const localFfmpegPath = path.join(process.cwd(), '..', 'ffmpeg-8.0.1-essentials_build', 'bin', 'ffmpeg.exe');
    if (fs.existsSync(localFfmpegPath)) {
      ffmpegPath = localFfmpegPath; // Spawn doesn't need quotes usually
      console.log('Using local FFmpeg:', localFfmpegPath);
    } else {
      console.log('Using static FFmpeg:', ffmpegPath);
    }

    // FFmpeg args
    const args = [
      '-i', videoPath,
      '-vn',
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '32k',
      audioPath,
      '-y'
    ];

    await runCommand(ffmpegPath, args);

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
    return inputPath;
  }

  const outputPath = inputPath.replace(ext, '.mp4');

  try {
    console.log(`Converting ${ext} video to MP4...`);

    let ffmpegPath = ffmpegStatic || 'ffmpeg';
    const localFfmpegPath = path.join(process.cwd(), '..', 'ffmpeg-8.0.1-essentials_build', 'bin', 'ffmpeg.exe');
    if (fs.existsSync(localFfmpegPath)) {
      ffmpegPath = localFfmpegPath;
    }

    // FFmpeg args for conversion
    const args = [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath,
      '-y'
    ];

    await runCommand(ffmpegPath, args);
    console.log('Conversion complete. New file:', outputPath);

    return outputPath;
  } catch (error: any) {
    console.error('Video conversion error:', error);
    throw new Error(`Failed to convert video: ${error.message}`);
  }
};

export const transcribeVideo = async (videoPath: string): Promise<TranscriptionResult> => {
  let audioPath: string | null = null;

  try {
    console.log('Starting transcription for:', videoPath);

    // Extract audio
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
