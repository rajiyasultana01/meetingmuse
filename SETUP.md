# MeetingMind Setup Guide

This guide will help you set up the complete MeetingMind application with AI-powered meeting summarization.

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key (for Whisper transcription)
- Groq API key (for AI summaries - free tier available)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Note down your project URL and anon key (already in `frontend/.env`)

### 1.2 Run Database Migration

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
supabase init
```

3. Link to your project:
```bash
supabase link --project-ref yhlsdvlihpejrjkdigdj
```

4. Run the migration:
```bash
supabase db push
```

Alternatively, you can run the SQL migration manually in the Supabase SQL Editor:
- Go to your Supabase Dashboard → SQL Editor
- Copy the content from `supabase/migrations/20250125_initial_schema.sql`
- Run it

### 1.3 Create Storage Buckets

In Supabase Dashboard → Storage:

1. Create a new bucket named `meeting-videos`
   - Make it **private** (not public)
   - Set max file size to 150MB

2. Create a new bucket named `meeting-thumbnails`
   - Make it **public**
   - Set max file size to 5MB

### 1.4 Deploy Edge Functions

1. Deploy the processing function:
```bash
supabase functions deploy process-meeting-video
```

2. Deploy the API endpoint:
```bash
supabase functions deploy api-receive-recording
```

3. Set environment variables (secrets):
```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
supabase secrets set GROQ_API_KEY=your_groq_api_key_here
supabase secrets set API_SECRET_KEY=your_random_secret_for_external_api
```

## Step 2: Get API Keys

### 2.1 OpenAI API Key (Whisper)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again)

**Cost**: ~$0.006 per minute of audio

### 2.2 Groq API Key (LLM for Summaries)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in or create an account
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

**Cost**: Free tier available with generous limits

### 2.3 Generate API Secret (for External Integration)

Generate a random secret for external API authentication:
```bash
openssl rand -base64 32
```

Or use any random string generator.

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Update Environment Variables

The `.env` file is already configured with your Supabase credentials. No changes needed unless you created a new Supabase project.

### 3.3 Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Step 4: Test the System

### 4.1 Create a Test User

1. Go to `http://localhost:8080`
2. Click "Sign Up"
3. Create an account with your email
4. Check Supabase Dashboard → Authentication to verify the user was created

### 4.2 Upload a Meeting Video

1. Sign in to your account
2. Navigate to "Summarize Meeting"
3. Upload a short video file (start with a small test video)
4. Click "Generate AI Summary"
5. Wait for processing (may take a few minutes depending on video length)

### 4.3 Verify the Processing

Check in Supabase Dashboard:
- **Meetings table**: Should have a record with status "completed"
- **Transcripts table**: Should have the extracted transcript
- **Summaries table**: Should have the AI-generated summary
- **Storage → meeting-videos**: Should have your uploaded video

## Step 5: External API Integration (Optional)

If you want to integrate with external screen recording software:

### Endpoint

```
POST https://yhlsdvlihpejrjkdigdj.supabase.co/functions/v1/api-receive-recording
```

### Headers

```
Content-Type: application/json
x-api-key: YOUR_API_SECRET_KEY
```

### Request Body

```json
{
  "video": "base64_encoded_video_data",
  "fileName": "meeting-2024-01-25.mp4",
  "title": "Team Standup Meeting",
  "description": "Daily standup for project X",
  "userId": "uuid-of-user",
  "metadata": {
    "duration": 1800,
    "participants": ["Alice", "Bob", "Charlie"]
  }
}
```

Or with a video URL:

```json
{
  "videoUrl": "https://example.com/meeting-recording.mp4",
  "fileName": "meeting-2024-01-25.mp4",
  "title": "Team Standup Meeting",
  "userId": "uuid-of-user"
}
```

### Example with cURL

```bash
curl -X POST https://yhlsdvlihpejrjkdigdj.supabase.co/functions/v1/api-receive-recording \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_SECRET_KEY" \
  -d '{
    "videoUrl": "https://example.com/recording.mp4",
    "fileName": "meeting.mp4",
    "title": "Weekly Review",
    "userId": "user-uuid-here"
  }'
```

## Troubleshooting

### Videos not processing

1. Check Supabase Functions logs:
   - Dashboard → Edge Functions → process-meeting-video → Logs

2. Verify API keys are set:
```bash
supabase secrets list
```

### Storage permission errors

1. Verify storage buckets exist and have correct permissions
2. Check RLS policies in database

### Transcription fails

1. Ensure video file is in supported format (MP4, MOV, AVI)
2. Check video file size (max 100MB for frontend upload)
3. Verify OpenAI API key has credits

### Summary generation fails

1. Check Groq API key is valid
2. Verify you haven't hit rate limits
3. Check function logs for error details

## Cost Estimates

For a 30-minute meeting:
- **Transcription (Whisper)**: ~$0.18
- **Summary (Groq)**: Free tier (or ~$0.02 if paid)
- **Total**: ~$0.20 per 30-minute meeting

## Next Steps

1. Customize the summary prompt in `supabase/functions/process-meeting-video/index.ts`
2. Add more sophisticated transcript cleaning
3. Implement speaker diarization (identifying different speakers)
4. Add support for multiple languages
5. Create scheduled processing for large batches
6. Add email notifications when processing completes

## Support

For issues or questions:
- Check Supabase function logs
- Review the code in `supabase/functions/`
- Check API provider status pages

---

**Built with**: Supabase, OpenAI Whisper, Groq, React, TypeScript
