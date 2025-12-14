import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';

// Fix DNS resolution issues by forcing Google DNS (useful for Render)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.error('Failed to apply DNS fix in transcription service:', e);
}

export interface TranscriptionResult {
  text: string;
  language?: string;
}

const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  return 'video/mp4'; // Default fallback
};

export const transcribeVideo = async (videoPath: string): Promise<TranscriptionResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. FFmpeg fallback has been disabled. Please add the Gemini key to Render.");
  }

  console.log('Starting Gemini transcription (Lightweight Mode)...');

  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // 1. Upload File
    console.log('Uploading video to Gemini...');
    const uploadResult = await fileManager.uploadFile(videoPath, {
      mimeType: getMimeType(videoPath),
      displayName: path.basename(videoPath),
    });

    const fileUri = uploadResult.file.uri;
    console.log(`Uploaded file: ${fileUri}`);

    // 2. Wait for Processing
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
      console.log('Gemini processing video...');
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Check every 5s
      file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Gemini video processing failed.");
    }

    console.log('Video processed. Generating transcript...');

    // 3. Generate Transcript
    const prompt = `Transcribe this meeting video word-for-word. 
    Provide the full transcript. 
    If there are multiple speakers, label them as Speaker 1, Speaker 2, etc. 
    Do not add any markdown formatting like **bold** or headers, just the plain text transcript.`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: fileUri,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini transcription complete.');

    // Cleanup: Delete file from Gemini immediately
    try {
      await fileManager.deleteFile(uploadResult.file.name);
      console.log('Deleted temporary Gemini file.');
    } catch (e) {
      console.warn('Failed to delete Gemini file:', e);
    }

    return {
      text: text,
      language: 'en',
    };

  } catch (error: any) {
    console.error('Gemini Transcription Error:', error);
    throw new Error(`Gemini Transcription failed: ${error.message}`);
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
