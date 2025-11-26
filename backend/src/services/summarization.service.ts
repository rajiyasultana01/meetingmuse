import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  participants?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export const generateSummary = async (transcript: string): Promise<SummaryResult> => {
  try {
    console.log('Generating summary with Groq...');

    const prompt = `You are an expert meeting analyst. Analyze the following meeting transcript and provide a comprehensive summary.

Transcript:
"""
${transcript}
"""

Please provide:
1. A concise summary (2-3 paragraphs)
2. Key points discussed (as bullet points)
3. Action items identified (as bullet points with responsible parties if mentioned)
4. Main topics covered
5. Overall sentiment (positive, neutral, or negative)
6. Participants mentioned (if any)

Format your response as JSON with the following structure:
{
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": ["string"],
  "topics": ["string"],
  "participants": ["string"],
  "sentiment": "positive|neutral|negative"
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
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
        topics: result.topics || [],
        participants: result.participants || [],
        sentiment: result.sentiment || 'neutral',
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        summary: content,
        keyPoints: [],
        actionItems: [],
        topics: [],
        sentiment: 'neutral',
      };
    }
  } catch (error: any) {
    console.error('Summarization error:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};
