import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MeetingProcessRequest {
  video: string // base64 encoded video
  fileName: string
  title?: string
  description?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const groqApiKey = Deno.env.get('GROQ_API_KEY')

    if (!openaiApiKey || !groqApiKey) {
      throw new Error('Missing required API keys. Please set OPENAI_API_KEY and GROQ_API_KEY in your environment.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { video, fileName, title, description }: MeetingProcessRequest = await req.json()

    console.log('Processing video:', fileName)

    // Step 1: Upload video to Supabase Storage
    const videoBuffer = Uint8Array.from(atob(video), c => c.charCodeAt(0))
    const fileExt = fileName.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meeting-videos')
      .upload(filePath, videoBuffer, {
        contentType: `video/${fileExt}`,
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload video: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('meeting-videos')
      .getPublicUrl(filePath)

    // Step 2: Create meeting record
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title: title || fileName.replace(/\.[^/.]+$/, ''),
        description: description || '',
        video_path: filePath,
        video_url: publicUrl,
        status: 'processing'
      })
      .select()
      .single()

    if (meetingError) {
      throw new Error(`Failed to create meeting: ${meetingError.message}`)
    }

    console.log('Meeting created:', meeting.id)

    // Step 3: Extract transcript using OpenAI Whisper
    await supabase
      .from('meetings')
      .update({ status: 'transcribing' })
      .eq('id', meeting.id)

    const transcript = await extractTranscript(videoBuffer, fileName, openaiApiKey)

    // Step 4: Save raw transcript
    const { data: transcriptRecord, error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        meeting_id: meeting.id,
        raw_transcript: transcript.text,
        language: transcript.language || 'en',
        confidence_score: null,
        word_count: transcript.text.split(/\s+/).length
      })
      .select()
      .single()

    if (transcriptError) {
      throw new Error(`Failed to save transcript: ${transcriptError.message}`)
    }

    console.log('Transcript saved:', transcriptRecord.id)

    // Step 5: Clean the transcript
    const cleanedTranscript = cleanTranscriptData(transcript.text)

    await supabase
      .from('transcripts')
      .update({ cleaned_transcript: cleanedTranscript })
      .eq('id', transcriptRecord.id)

    // Step 6: Generate AI summary using Groq
    await supabase
      .from('meetings')
      .update({ status: 'summarizing' })
      .eq('id', meeting.id)

    const summary = await generateSummary(cleanedTranscript, groqApiKey)

    // Step 7: Save summary
    const { data: summaryRecord, error: summaryError } = await supabase
      .from('summaries')
      .insert({
        meeting_id: meeting.id,
        transcript_id: transcriptRecord.id,
        summary_text: summary.summary,
        key_points: summary.keyPoints,
        action_items: summary.actionItems,
        topics: summary.topics,
        participants: summary.participants || [],
        sentiment: summary.sentiment || 'neutral'
      })
      .select()
      .single()

    if (summaryError) {
      throw new Error(`Failed to save summary: ${summaryError.message}`)
    }

    // Step 8: Mark as completed
    await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('id', meeting.id)

    console.log('Meeting processing completed:', meeting.id)

    return new Response(
      JSON.stringify({
        success: true,
        meetingId: meeting.id,
        summary: summary.summary,
        transcript: cleanedTranscript,
        keyPoints: summary.keyPoints,
        actionItems: summary.actionItems
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing video:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Extract transcript using OpenAI Whisper API
async function extractTranscript(
  videoBuffer: Uint8Array,
  fileName: string,
  apiKey: string
): Promise<{ text: string; language?: string }> {
  const formData = new FormData()
  const blob = new Blob([videoBuffer], { type: 'video/mp4' })
  formData.append('file', blob, fileName)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'json')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Whisper API error: ${error}`)
  }

  const result = await response.json()
  return {
    text: result.text,
    language: result.language
  }
}

// Clean transcript data
function cleanTranscriptData(rawTranscript: string): string {
  let cleaned = rawTranscript

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Fix common transcription errors
  cleaned = cleaned.replace(/\buh+\b/gi, '')
  cleaned = cleaned.replace(/\bum+\b/gi, '')
  cleaned = cleaned.replace(/\ber+\b/gi, '')

  // Capitalize sentences
  cleaned = cleaned.replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase())

  // Remove duplicate sentences
  const sentences = cleaned.split(/\.\s+/)
  const uniqueSentences = [...new Set(sentences)]
  cleaned = uniqueSentences.join('. ')

  return cleaned
}

// Generate summary using Groq API
async function generateSummary(
  transcript: string,
  apiKey: string
): Promise<{
  summary: string
  keyPoints: string[]
  actionItems: string[]
  topics: string[]
  participants?: string[]
  sentiment?: string
}> {
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
  "sentiment": "string"
}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting analyst. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const result = await response.json()
  const content = result.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      summary: content,
      keyPoints: [],
      actionItems: [],
      topics: [],
      sentiment: 'neutral'
    }
  }
}
