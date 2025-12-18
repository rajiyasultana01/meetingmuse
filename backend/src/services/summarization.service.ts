import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SummaryResult {
  summary: string;
  deepDiveSummary?: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  participants?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentReason?: string;
  coachingTips?: string[];
}

export const generateSummary = async (transcript: string): Promise<SummaryResult> => {
  try {
    console.log('Generating summary with OpenAI...');

    const prompt = `You are an expert meeting analyst with exceptional attention to detail. Analyze the following meeting transcript and provide an EXTREMELY COMPREHENSIVE and DETAILED report.

Transcript:
"""
${transcript}
"""

Please provide:

1. **EXECUTIVE SUMMARY** (500-800 words minimum):
   - Write a comprehensive, high-level overview that captures EVERYTHING important
   - Include: meeting purpose, context, ALL critical decisions made, key outcomes, major topics discussed, and overall flow
   - DO NOT omit any significant topic, decision, or discussion point
   - Maintain a professional, tight writing style while being thorough
   - Include specific details, numbers, names, and dates mentioned
   - Highlight both what was decided AND what remains pending

2. **DETAILED DEEP-DIVE SUMMARY** (1500-3000 words minimum):
   - This is the PRIMARY deliverable - make it EXCEPTIONALLY detailed
   - Provide a chronological, comprehensive narrative of the ENTIRE meeting from start to finish
   - For EACH topic discussed:
     * Explain what was discussed and WHY it matters
     * Include all arguments, perspectives, and viewpoints raised
     * Document the reasoning and logic behind decisions
     * Capture concerns, questions, and objections raised
     * Note any debates, disagreements, or areas of consensus
   - Include ALL contextual information shared (background, history, constraints)
   - Document every decision point and the rationale behind it
   - Capture nuances, tone, and subtext where evident
   - Include specific examples, data points, or scenarios discussed
   - Note connections between different topics
   - This should serve as a complete meeting record that someone who wasn't there could read and understand EVERYTHING that happened

3. **KEY POINTS DISCUSSED** (comprehensive list):
   - List EVERY significant point raised, not just highlights
   - Include context for each point
   - Organize by topic/theme if applicable

4. **ACTION ITEMS** (detailed format):
   - For EACH action item include:
     * What needs to be done (be specific)
     * Who is responsible (if mentioned)
     * Deadline or timeframe (if specified)
     * Why it's important / context
     * Any dependencies or prerequisites

5. **MAIN TOPICS COVERED** (ALL topics):
   - List every topic discussed, including minor ones
   - Include brief description of what was covered for each

6. **OVERALL SENTIMENT**: positive, neutral, or negative
   - Explain why you chose this sentiment

7. **PARTICIPANTS MENTIONED**:
   - List all people mentioned or referenced

8. **COACHING TIPS** (5-8 suggestions):
   - Provide constructive, specific suggestions for improving future meetings
   - Cover: clarity, engagement, time management, structure, decision-making, follow-up, etc.

CRITICAL INSTRUCTIONS:
- Be extremely thorough and detailed - err on the side of including MORE rather than less
- The deep-dive summary should be the longest and most comprehensive section
- Capture the full context and reasoning behind discussions, not just the conclusions
- Write in clear, professional prose (not bullet points) for the summaries
- Think of this as creating a comprehensive meeting record for posterity

Format your response as JSON with the following structure:
{
  "summary": "string (executive summary, 500-800 words MINIMUM)",
  "deepDiveSummary": "string (detailed narrative, 1500-3000 words MINIMUM - make this VERY comprehensive)",
  "keyPoints": ["string with context"],
  "actionItems": ["string with full details: what, who, when, why"],
  "topics": ["string with brief description"],
  "participants": ["string"],
  "sentiment": "positive|neutral|negative",
  "sentimentReason": "string (explanation of sentiment)",
  "coachingTips": ["string (specific, actionable suggestion)"]
}`;

    const chatCompletion = await openai.chat.completions.create({
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
      model: 'gpt-4o-mini', // Cost-effective and powerful for summarization
      temperature: 0.3,
      max_tokens: 16000, // Allow much longer, more detailed responses
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    try {
      const result = JSON.parse(content);

      console.log(`Summary length: ${result.summary?.length || 0} chars`);
      console.log(`Deep-dive length: ${result.deepDiveSummary?.length || 0} chars`);

      return {
        summary: result.summary || '',
        deepDiveSummary: result.deepDiveSummary || result.summary || '', // Fallback to normal summary if missing
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
        topics: result.topics || [],
        participants: result.participants || [],
        sentiment: result.sentiment || 'neutral',
        sentimentReason: result.sentimentReason || '',
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
        sentimentReason: '',
        coachingTips: [],
      };
    }
  } catch (error: any) {
    console.error('Summarization error:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};
