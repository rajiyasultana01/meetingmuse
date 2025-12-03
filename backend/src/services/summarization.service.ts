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

    const prompt = `You are an expert meeting analyst. Analyze the following meeting transcript and provide a COMPREHENSIVE and DETAILED summary that captures ALL important discussions, decisions, and context.

Transcript:
"""
${transcript}
"""

Please provide:
1. A DETAILED and COMPREHENSIVE summary that covers:
   - The main purpose and context of the meeting
   - ALL key discussions in chronological order
   - All important points raised by participants
   - Any decisions made or conclusions reached
   - Background information and context provided
   - Examples, data, or specifics mentioned
   - Any concerns, questions, or challenges discussed
   - The length should be proportional to the meeting content (aim for thorough coverage, not brevity)

2. Key points discussed (comprehensive list, not just highlights)
3. Action items identified (with responsible parties if mentioned, deadlines if specified)
4. Main topics covered (all topics, not just major ones)
5. Overall sentiment (positive, neutral, or negative)
6. Participants mentioned (if any)

IMPORTANT: The summary should be detailed enough that someone who didn't attend the meeting can understand everything that was discussed. Do not omit important details for the sake of brevity.

Format your response as JSON with the following structure:
{
  "summary": "string (detailed, multiple paragraphs covering all discussions)",
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
          content: 'You are an expert meeting analyst. Always respond with valid JSON. Provide detailed, comprehensive summaries that capture all important information.',
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
