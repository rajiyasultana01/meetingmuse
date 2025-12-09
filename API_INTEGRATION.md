# External API Integration Guide

This guide explains how to integrate external screen recording software or automation tools with MeetingMind.

## Overview

MeetingMind provides a REST API endpoint that allows external systems to submit meeting recordings for automatic transcription and summarization.

## Authentication

All API requests must include an API key in the headers:

```
x-api-key: YOUR_API_SECRET_KEY
```

The API secret is configured in your backend `.env` file.

## Endpoint

```
POST http://your-backend-url:5000/api/external/receive-recording
```

Replace `your-backend-url` with your deployed backend URL (or use `localhost:5000` for local development).

## Request Format

### Headers

```
Content-Type: application/json
x-api-key: YOUR_API_SECRET_KEY
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video` | string | Yes* | Base64-encoded video file |
| `videoUrl` | string | Yes* | URL to download video from |
| `fileName` | string | Yes | Original filename (e.g., "meeting.mp4") |
| `title` | string | No | Meeting title (defaults to filename) |
| `description` | string | No | Meeting description |
| `userId` | string | Yes | UUID of the user who owns this meeting |
| `externalId` | string | No | Your system's ID for this recording |
| `metadata` | object | No | Additional metadata |

\* Either `video` (base64) OR `videoUrl` must be provided

### Metadata Object (Optional)

```json
{
  "duration": 1800,
  "participants": ["Alice", "Bob"],
  "meetingDate": "2024-01-25T10:00:00Z",
  "customField": "value"
}
```

## Examples

### Example 1: Upload Base64-Encoded Video

```bash
curl -X POST http://localhost:5000/api/external/receive-recording \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_SECRET_KEY" \
  -d '{
    "video": "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA...",
    "fileName": "standup-2024-01-25.mp4",
    "title": "Daily Standup - Jan 25",
    "description": "Engineering team daily standup",
    "userId": "firebase-user-id",
    "metadata": {
      "duration": 900,
      "participants": ["Alice", "Bob", "Charlie"]
    }
  }'
```

### Example 2: Provide Video URL

```bash
curl -X POST http://localhost:5000/api/external/receive-recording \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_SECRET_KEY" \
  -d '{
    "videoUrl": "https://example.com/recordings/meeting-123.mp4",
    "fileName": "meeting-123.mp4",
    "title": "Sprint Planning",
    "userId": "firebase-user-id",
    "externalId": "zoom-meeting-123"
  }'
```

### Example 3: Python Integration

```python
import requests
import base64

def upload_meeting_recording(video_path, user_id, title):
    """Upload a meeting recording to MeetingMind"""

    # Read and encode video
    with open(video_path, 'rb') as f:
        video_data = base64.b64encode(f.read()).decode('utf-8')

    # Prepare request
    url = "http://localhost:5000/api/external/receive-recording"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_SECRET_KEY"
    }

    payload = {
        "video": video_data,
        "fileName": video_path.split('/')[-1],
        "title": title,
        "userId": user_id,  # Firebase user ID
        "metadata": {
            "uploadedBy": "python-script"
        }
    }

    # Send request
    response = requests.post(url, json=payload, headers=headers)

    if response.ok:
        data = response.json()
        print(f"Success! Meeting ID: {data['meetingId']}")
        print(f"Status: {data['status']}")
        return data
    else:
        print(f"Error: {response.text}")
        return None

# Usage
upload_meeting_recording(
    "/path/to/meeting.mp4",
    "firebase-user-id",
    "Team Sync - Jan 25"
)
```

### Example 4: Node.js Integration

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

async function uploadMeeting(videoPath, userId, title) {
  // Read and encode video
  const videoBuffer = fs.readFileSync(videoPath);
  const videoBase64 = videoBuffer.toString('base64');

  const response = await fetch(
    'http://localhost:5000/api/external/receive-recording',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_SECRET_KEY'
      },
      body: JSON.stringify({
        video: videoBase64,
        fileName: videoPath.split('/').pop(),
        title: title,
        userId: userId,  // Firebase user ID
        metadata: {
          uploadedBy: 'nodejs-script'
        }
      })
    }
  );

  const data = await response.json();
  console.log('Response:', data);
  return data;
}

// Usage
uploadMeeting('./meeting.mp4', 'firebase-user-id', 'Weekly Review')
  .then(result => console.log('Meeting uploaded:', result.meetingId))
  .catch(error => console.error('Error:', error));
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "meetingId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Recording received and processing started",
  "status": "processing"
}
```

### Error Response (400/401)

```json
{
  "error": "Error message describing what went wrong"
}
```

## Processing Pipeline

Once a recording is submitted via the API:

1. **Validation**: API key and request parameters are validated
2. **Upload**: Video is uploaded to Firebase Storage and saved locally
3. **Meeting Record**: A meeting record is created in MongoDB
4. **Transcription**: OpenAI Whisper extracts the transcript
5. **Cleaning**: Transcript is cleaned and normalized
6. **Summarization**: Groq AI generates a comprehensive summary
7. **Completion**: Meeting status is updated to "completed"

The entire process typically takes 2-5 minutes depending on video length.

## Monitoring Processing Status

You can query the meeting status using the backend API:

```javascript
// Using the frontend API client
import { meetingsAPI } from './lib/api';

const response = await meetingsAPI.getById(meetingId);
const { meeting, transcript, summary } = response.data;

console.log('Status:', meeting.status);
// Possible values: 'uploaded', 'processing', 'transcribing', 'summarizing', 'completed', 'failed'
```

## Use Cases

### 1. Zoom Integration
Automatically send Zoom cloud recordings to MeetingMind after each meeting.

### 2. OBS/Screen Recording
Trigger upload after local screen recording completes.

### 3. Meeting Bot
Use a bot to join meetings, record them, and submit to MeetingMind.

### 4. CRM Integration
Connect with your CRM to automatically summarize client calls.

### 5. CI/CD Pipeline
Process meeting recordings as part of your automated workflows.

## Rate Limits

- **File Size**: Max 150MB per video
- **Concurrent Uploads**: Depends on your Supabase plan
- **API Calls**: No hard limit, but be reasonable

## Best Practices

1. **Use Video URLs when possible** - Faster than base64 encoding
2. **Include meaningful metadata** - Helps with organization
3. **Store external IDs** - Makes it easier to link back to your system
4. **Implement error handling** - Network issues, API failures, etc.
5. **Compress videos** - Smaller files process faster
6. **Test with small videos first** - Verify integration before scaling

## Security

- **Never expose API key** - Keep it secret, rotate regularly
- **Use HTTPS** - Always use secure connections
- **Validate user IDs** - Ensure user exists before uploading
- **Monitor usage** - Watch for unusual patterns

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Invalid API key | Check x-api-key header matches backend .env |
| "User not found" | Invalid userId | Verify Firebase user exists and is synced to MongoDB |
| "Failed to upload video" | Storage issue | Check Firebase Storage permissions |
| "Failed to download video" | Invalid URL | Verify videoUrl is accessible |
| Timeout | Video too large | Compress or split the video |

## Support

For integration support:
1. Check backend server logs (terminal or hosting platform logs)
2. Verify API key is correct in backend `.env`
3. Test with small sample video first
4. Review error messages carefully
5. Ensure MongoDB connection is active

---

**Need help?** Check the main [SETUP.md](./SETUP.md) for general configuration.
