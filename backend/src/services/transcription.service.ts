import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  language?: string;
}

export const transcribeVideo = async (videoPath: string): Promise<TranscriptionResult> => {
  try {
    console.log('Starting transcription for:', videoPath);

    const fileStream = fs.createReadStream(videoPath);

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'json',
    });

    return {
      text: response.text,
      language: response.language || 'en',
    };
  } catch (error: any) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe video: ${error.message}`);
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
