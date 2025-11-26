import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface ExternalRecordingRequest {
  video?: string // base64 encoded video
  videoUrl?: string // URL to download video from
  fileName: string
  title?: string
  description?: string
  userId?: string // Optional user ID
  externalId?: string // External system's ID for this recording
  metadata?: {
    duration?: number
    participants?: string[]
    meetingDate?: string
    [key: string]: any
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const apiSecret = Deno.env.get('API_SECRET_KEY') // For authenticating external API calls

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Authenticate the external API call
    const apiKey = req.headers.get('x-api-key')
    if (!apiSecret || apiKey !== apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Invalid API key.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        },
      )
    }

    const requestData: ExternalRecordingRequest = await req.json()
    const { video, videoUrl, fileName, title, description, userId, externalId, metadata } = requestData

    console.log('Received external recording:', fileName)

    // Validate request
    if (!video && !videoUrl) {
      throw new Error('Either video (base64) or videoUrl must be provided')
    }

    if (!fileName) {
      throw new Error('fileName is required')
    }

    // Step 1: Get or create user
    let targetUserId = userId

    if (!targetUserId) {
      // If no userId provided, use a default system user or create one
      // For now, we'll require userId
      throw new Error('userId is required for external API calls')
    }

    // Verify user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .single()

    if (profileError || !profile) {
      throw new Error(`User not found: ${targetUserId}`)
    }

    // Step 2: Download or process video
    let videoBuffer: Uint8Array

    if (video) {
      // Base64 encoded video provided
      videoBuffer = Uint8Array.from(atob(video), c => c.charCodeAt(0))
    } else if (videoUrl) {
      // Download video from URL
      const videoResponse = await fetch(videoUrl)
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video from URL: ${videoUrl}`)
      }
      const arrayBuffer = await videoResponse.arrayBuffer()
      videoBuffer = new Uint8Array(arrayBuffer)
    } else {
      throw new Error('No video data provided')
    }

    // Step 3: Upload to Supabase Storage
    const fileExt = fileName.split('.').pop() || 'mp4'
    const filePath = `${targetUserId}/external_${externalId || Date.now()}.${fileExt}`

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

    // Step 4: Create meeting record
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: targetUserId,
        title: title || fileName.replace(/\.[^/.]+$/, ''),
        description: description || `External recording uploaded via API${externalId ? ` (ID: ${externalId})` : ''}`,
        video_path: filePath,
        video_url: publicUrl,
        status: 'uploaded',
        duration_seconds: metadata?.duration || null
      })
      .select()
      .single()

    if (meetingError) {
      throw new Error(`Failed to create meeting: ${meetingError.message}`)
    }

    console.log('Meeting created from external API:', meeting.id)

    // Step 5: Trigger processing (call the process-meeting-video function)
    // Note: In production, you might want to use a queue system for this
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const groqApiKey = Deno.env.get('GROQ_API_KEY')

    if (openaiApiKey && groqApiKey) {
      // Process in background (simplified - in production use a job queue)
      processVideoAsync(meeting.id, videoBuffer, fileName, supabase, openaiApiKey, groqApiKey)
        .catch(error => {
          console.error('Background processing error:', error)
          // Update meeting status to failed
          supabase
            .from('meetings')
            .update({ status: 'failed', error_message: error.message })
            .eq('id', meeting.id)
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        meetingId: meeting.id,
        message: 'Recording received and processing started',
        status: 'processing'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error receiving external recording:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Process video asynchronously (simplified version)
async function processVideoAsync(
  meetingId: string,
  videoBuffer: Uint8Array,
  fileName: string,
  supabase: any,
  openaiApiKey: string,
  groqApiKey: string
): Promise<void> {
  try {
    // Update status
    await supabase
      .from('meetings')
      .update({ status: 'transcribing' })
      .eq('id', meetingId)

    // Extract transcript
    const transcript = await extractTranscript(videoBuffer, fileName, openaiApiKey)

    // Save transcript
    const { data: transcriptRecord } = await supabase
      .from('transcripts')
      .insert({
        meeting_id: meetingId,
        raw_transcript: transcript.text,
        language: transcript.language || 'en',
        word_count: transcript.text.split(/\s+/).length
      })
      .select()
      .single()

    // Clean transcript
    const cleanedTranscript = cleanTranscriptData(transcript.text)
    await supabase
      .from('transcripts')
      .update({ cleaned_transcript: cleanedTranscript })
      .eq('id', transcriptRecord.id)

    // Generate summary
    await supabase
      .from('meetings')
      .update({ status: 'summarizing' })
      .eq('id', meetingId)

    const summary = await generateSummary(cleanedTranscript, groqApiKey)

    // Save summary
    await supabase
      .from('summaries')
      .insert({
        meeting_id: meetingId,
        transcript_id: transcriptRecord.id,
        summary_text: summary.summary,
        key_points: summary.keyPoints,
        action_items: summary.actionItems,
        topics: summary.topics,
        participants: summary.participants || [],
        sentiment: summary.sentiment || 'neutral'
      })

    // Mark as completed
    await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('id', meetingId)

    console.log('Async processing completed for meeting:', meetingId)
  } catch (error) {
    console.error('Error in async processing:', error)
    await supabase
      .from('meetings')
      .update({ status: 'failed', error_message: error.message })
      .eq('id', meetingId)
    throw error
  }
}

// Helper functions (same as in process-meeting-video)
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

function cleanTranscriptData(rawTranscript: string): string {
  let cleaned = rawTranscript
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  cleaned = cleaned.replace(/\buh+\b/gi, '')
  cleaned = cleaned.replace(/\bum+\b/gi, '')
  cleaned = cleaned.replace(/\ber+\b/gi, '')
  cleaned = cleaned.replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase())
  const sentences = cleaned.split(/\.\s+/)
  const uniqueSentences = [...new Set(sentences)]
  cleaned = uniqueSentences.join('. ')
  return cleaned
}

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
    return {
      summary: content,
      keyPoints: [],
      actionItems: [],
      topics: [],
      sentiment: 'neutral'
    }
  }
}
