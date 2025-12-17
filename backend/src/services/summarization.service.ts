import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface SummaryResult {
  summary: string;
  deepDiveSummary?: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  participants?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  coachingTips?: string[];
}

export const generateSummary = async (transcript: string): Promise<SummaryResult> => {
  try {
    console.log('Generating summary with Groq...');

    const prompt = `You are an expert meeting analyst. Analyze the following meeting transcript and provide a COMPREHENSIVE report.

Transcript:
"""
${transcript}
"""

Please provide:
1. An EXECUTIVE SUMMARY (approx. 300-500 words) that serves as a high-level overview. This MUST capture the main purpose, ALL critical decisions, key outcomes, and major topics discussed. Ensure that NO important topic is omitted, but keep the writing style tight, professional, and focused on high-value information.

2. Key points discussed (comprehensive list, not just highlights)
3. Action items identified (with responsible parties if mentioned, deadlines if specified)
4. Main topics covered (all topics, not just major ones)
5. Overall sentiment (positive, neutral, or negative)
6. Participants mentioned (if any)
7. Coaching tips: Provide 3-5 constructive suggestions for the meeting participants or organizer to improve future meetings (e.g. regarding clarity, engagement, time management, structure, conflict resolution).
8. A DETAILED DEEP-DIVE SUMMARY: A comprehensive, detailed narrative of the entire meeting, covering all discussions in depth. This should be much longer and more detailed than the executive summary, serving as a full record of the discussion logic and details.

Format your response as JSON with the following structure:
{
  "summary": "string (executive summary, 300-500 words)",
  "deepDiveSummary": "string (detailed, long narrative)",
  "keyPoints": ["string"],
  "actionItems": ["string"],
  "topics": ["string"],
  "participants": ["string"],
  "sentiment": "positive|neutral|negative",
  "coachingTips": ["string"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting analyst. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 8000, // Allow longer, more detailed responses
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq API');
    }

    try {
      const result = JSON.parse(content);
      return {
        summary: result.summary || '',
        deepDiveSummary: result.deepDiveSummary || result.summary || '', // Fallback to normal summary if missing
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
        topics: result.topics || [],
        participants: result.participants || [],
        sentiment: result.sentiment || 'neutral',
        coachingTips: result.coachingTips || [],
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        summary: content,
        deepDiveSummary: content,
        keyPoints: [],
        actionItems: [],
        topics: [],
        sentiment: 'neutral',
        coachingTips: [],
      };
    }
  } catch (error: any) {
    console.error('Summarization error:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};
