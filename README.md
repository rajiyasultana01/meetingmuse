# MeetingMind - AI-Powered Meeting Summarization

Transform your meeting recordings into actionable insights with AI-powered transcription and intelligent summarization.

![MeetingMind](frontend/public/og-image.png)

## Features

- **AI-Powered Transcription** - Automatic speech-to-text using OpenAI Whisper
- **Intelligent Summarization** - Generate comprehensive summaries with Groq LLaMA 3.3
- **Two Upload Methods**
  - User uploads via web interface
  - External API for screen recording software integration
- **Action Items Extraction** - Automatically identify and list action items
- **Key Points & Topics** - Extract main discussion points and topics
- **Sentiment Analysis** - Understand the overall meeting tone
- **Video Playback** - Watch recordings with timestamp navigation
- **User & Admin Dashboards** - Manage meetings and users
- **Real-time Processing** - Track status: uploading → transcribing → summarizing → completed

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Services**:
  - OpenAI Whisper API (transcription)
  - Groq API with LLaMA 3.3 70B (summarization)
- **Deployment**: Supabase (backend), Lovable/Vercel (frontend)

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Groq API key (free tier available)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd meeting_muse

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run database migration**:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push
```

Or manually run the SQL from `supabase/migrations/20250125_initial_schema.sql` in the Supabase SQL Editor.

3. **Create storage buckets**:
   - `meeting-videos` (private, 150MB max)
   - `meeting-thumbnails` (public, 5MB max)

4. **Deploy edge functions**:
```bash
supabase functions deploy process-meeting-video
supabase functions deploy api-receive-recording
```

5. **Set environment secrets**:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GROQ_API_KEY=gsk_...
supabase secrets set API_SECRET_KEY=your-random-secret
```

## Usage

### User Upload

1. Sign up / Login
2. Navigate to "Summarize Meeting"
3. Upload a meeting video (MP4, MOV, AVI - max 100MB)
4. Wait for processing (2-5 minutes typically)
5. View transcript, summary, action items, and insights

### External API Integration

Integrate with screen recording software to automatically process recordings.

**Endpoint:**
```
POST https://your-project.supabase.co/functions/v1/api-receive-recording
```

**Headers:**
```
Content-Type: application/json
x-api-key: YOUR_API_SECRET_KEY
```

**Request Body:**
```json
{
  "video": "base64_encoded_video",
  "fileName": "meeting.mp4",
  "title": "Team Standup",
  "userId": "user-uuid",
  "metadata": {
    "duration": 1800,
    "participants": ["Alice", "Bob"]
  }
}
```

Or provide a video URL:
```json
{
  "videoUrl": "https://example.com/recording.mp4",
  "fileName": "meeting.mp4",
  "title": "Sprint Planning",
  "userId": "user-uuid"
}
```

See [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API documentation.

## Processing Pipeline

1. **Upload** - Video uploaded to Supabase Storage
2. **Transcription** - OpenAI Whisper extracts speech-to-text
3. **Cleaning** - Remove filler words, fix formatting
4. **Summarization** - Groq LLaMA generates:
   - Meeting summary
   - Key points discussed
   - Action items with owners
   - Main topics
   - Sentiment analysis
   - Participant mentions
5. **Storage** - Save to database
6. **Display** - Present in user dashboard

## Project Structure

```
meeting_muse/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── integrations/  # Supabase client & types
│   │   └── hooks/         # Custom React hooks
│   └── public/
├── supabase/              # Backend configuration
│   ├── migrations/        # Database schema
│   ├── functions/         # Edge functions
│   │   ├── process-meeting-video/
│   │   └── api-receive-recording/
│   └── config.toml
├── SETUP.md              # Detailed setup guide
├── API_INTEGRATION.md    # API documentation
└── README.md             # This file
```

## Database Schema

**Main Tables:**
- `profiles` - User profiles (extends Supabase auth)
- `meetings` - Meeting records with status tracking
- `transcripts` - Raw and cleaned transcripts
- `summaries` - AI-generated summaries with extracted insights
- `meeting_analytics` - View/share/download tracking

**Meeting Status Flow:**
```
uploaded → processing → transcribing → summarizing → completed
                                                    ↓
                                                 failed
```

## API Keys Setup

### OpenAI (Whisper)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Cost: ~$0.006/minute

### Groq (LLaMA)
1. Visit [console.groq.com](https://console.groq.com)
2. Create API key
3. Free tier available

### API Secret
Generate a secure random string:
```bash
openssl rand -base64 32
```

Add all to Supabase secrets:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GROQ_API_KEY=gsk_...
supabase secrets set API_SECRET_KEY=your-secret
```

## Cost Estimates

For a 30-minute meeting:
- **Transcription**: ~$0.18 (Whisper)
- **Summarization**: Free tier or ~$0.02 (Groq)
- **Total**: ~$0.20 per meeting

## Development

### Run Locally

```bash
# Frontend
cd frontend
npm run dev

# Supabase (if running locally)
supabase start
supabase functions serve
```

### Build for Production

```bash
cd frontend
npm run build
```

## Deployment

### Frontend
Deploy to Vercel, Netlify, or Lovable:
```bash
npm run build
# Deploy dist/ folder
```

### Backend
Supabase edge functions are automatically deployed:
```bash
supabase functions deploy
```

## Features Roadmap

- [ ] Speaker diarization (identify different speakers)
- [ ] Multi-language support
- [ ] Video thumbnail generation
- [ ] Email notifications on completion
- [ ] Bulk processing
- [ ] Meeting scheduling integration
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Slack/Teams notifications
- [ ] Custom summary templates
- [ ] Export to PDF/DOCX

## Troubleshooting

### Videos not processing
- Check Supabase Functions logs
- Verify API keys are set correctly
- Ensure video format is supported

### Database connection errors
- Verify Supabase URL and keys in `.env`
- Check Row Level Security policies
- Ensure migration has been run

### API authentication fails
- Verify `x-api-key` header is correct
- Check API secret in Supabase secrets

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## Security

- All API keys stored as Supabase secrets (never in code)
- Row Level Security (RLS) enabled on all tables
- User data isolated per user account
- External API requires secret key authentication
- Videos stored in private Supabase Storage bucket

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check [SETUP.md](./SETUP.md) for setup help
- Review [API_INTEGRATION.md](./API_INTEGRATION.md) for API docs
- Open an issue on GitHub

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Powered by [Supabase](https://supabase.com)
- AI by [OpenAI](https://openai.com) and [Groq](https://groq.com)
- UI components by [Shadcn](https://ui.shadcn.com)

---

**Made with ❤️ for better meetings**
