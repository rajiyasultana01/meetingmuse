# MeetingMuse - AI-Powered Meeting Summarization

Transform your meeting recordings into actionable insights with AI-powered transcription and intelligent summarization.

![MeetingMuse](frontend/public/og-image.png)

## Features

- **AI-Powered Transcription** - Automatic speech-to-text using Groq Whisper Large V3
- **Intelligent Summarization** - Generate comprehensive summaries with OpenAI GPT-4o Mini
- **Dual Upload Methods**
  - **Web Interface**: Monitor and manage meetings
  - **Chrome Extension (LexEye)**: Automatically record and upload directly from Google Meet, Zoom, and Teams
- **Smart Insights**
  - Executive Summary & Deep-Dive Analysis
  - Action Items Extraction
  - Key Points & Statistics
  - Sentiment Analysis
  - Participant Tracking
  - Coaching Tips
- **Robust Architecture**
  - **Dual Authentication**: Secure Firebase Login for Web + Custom JWT for Extension
  - **Resilient Storage**: Automatic fallback to local storage if Cloud Storage fails
  - **Real-time Status**: Track uploading, transcribing, and processing states

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: Firebase Auth (Frontend), Custom JWT (Backend-Extension)
- **AI Services**:
  - Groq Whisper Large V3 (Transcription)
  - OpenAI GPT-4o Mini (Summarization)
- **Storage**: Firebase Storage (Primary), Local Filesystem (Fallback)
- **Video Processing**: FFmpeg

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- FFmpeg (Installed and added to PATH)
- Firebase account (for Auth and Storage)
- Groq API key (free tier available)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` file:
```bash
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/meetingmuse
# OR for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/meetingmuse

API_SECRET_KEY=your-random-secret-key
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=http://localhost:8080

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

Update Firebase config in `frontend/src/config/firebase.ts` with your Firebase credentials.

Start the frontend:
```bash
npm run dev
```

Access the dashboard at `http://localhost:8080`.

### 3. Extension Setup (LexEye)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `LexEye` directory
4. Pin the extension
5. Log in using your MeetingMuse credentials

## Architecture Highlights

### Dual Authentication System
The system uses a hybrid authentication approach:
- **Web Frontend**: Uses Standard Firebase ID Tokens
- **Browser Extension**: Uses a custom backend-signed JWT mechanism to allow secure background uploads without persistent Firebase SDK instances in content scripts

### Storage Fallback
To ensure no recording is ever lost:
1. The system attempts to upload to Firebase Storage
2. If network/config fails, it automatically saves the file to the local server (`backend/uploads`)
3. The video remains accessible via a local static URL

## Processing Pipeline

1. **Upload** - Video uploaded to Firebase Storage and saved locally
2. **Extract Audio** - FFmpeg extracts audio from video (MP3, 32kbps, mono)
3. **Transcription** - Groq Whisper Large V3 converts speech to text
4. **Cleaning** - Remove filler words, fix formatting, remove duplicates
5. **Summarization** - OpenAI GPT-4o Mini generates:
   - Executive summary (500-800 words) - comprehensive high-level overview
   - Detailed deep-dive summary (1500-3000 words) - complete meeting record
   - Key points discussed (with context)
   - Action items (with who, what, when, why)
   - Main topics (all topics covered)
   - Sentiment analysis (with reasoning)
   - Participant mentions
   - Coaching tips (5-8 actionable suggestions)
6. **Storage** - Save to MongoDB
7. **Display** - Present in user dashboard

**Meeting Status Flow:**
```
uploaded → processing → transcribing → summarizing → completed
                                                    ↓
                                                 failed
```

## API Keys Setup

### Groq API (Transcription)
1. Visit [console.groq.com](https://console.groq.com)
2. Create API key
3. Free tier available (60 requests/minute)

### OpenAI API (Summarization)
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create API key
3. Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens (GPT-4o Mini)

### Firebase
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Cloud Storage
4. Generate service account key (Settings → Service Accounts)

### API Secret
Generate a secure random string:
```bash
openssl rand -base64 32
```

## Cost Estimates

For a 30-minute meeting:
- **Transcription**: ~$0.18 (Groq Whisper)
- **Summarization**: ~$0.05-0.08 (OpenAI GPT-4o Mini with detailed summaries)
- **Total**: ~$0.23-0.26 per meeting

## Project Structure

```
meetingmuse/
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (AI, storage)
│   │   ├── middleware/    # Auth & error handling
│   │   └── config/        # Database & Firebase config
│   └── uploads/           # Local video storage (fallback)
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API client & utilities
│   │   ├── config/        # Firebase configuration
│   │   └── hooks/         # Custom React hooks
│   └── dist/              # Production build
└── LexEye/               # Chrome Extension
    ├── manifest.json      # Extension manifest
    ├── background.js     # Service worker
    ├── content.js        # Meeting detection & recording
    └── popup.html/js     # Extension UI
```

## Database Schema (MongoDB)

**Main Collections:**
- `users` - User profiles (synced with Firebase Auth)
- `meetings` - Meeting records with status tracking
- `transcripts` - Raw and cleaned transcripts
- `summaries` - AI-generated summaries with extracted insights
- `meetinganalytics` - View/share/download tracking

## Development

```bash
# Backend
cd backend
npm run dev

# Frontend (in a new terminal)
cd frontend
npm run dev
```

## Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

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
- Check backend server logs
- Verify GROQ_API_KEY and OPENAI_API_KEY are set correctly
- Ensure FFmpeg is installed and in PATH
- Check MongoDB connection

### Database connection errors
- Verify MONGODB_URI in backend `.env`
- Check if MongoDB Atlas allows connections from your IP
- Ensure MongoDB is running

### Extension login fails
- Ensure backend is running
- Check CORS settings in backend
- Verify `localhost:5000` is reachable

### Firebase errors
- Verify Firebase credentials in backend `.env`
- Check Firebase project settings
- Ensure Storage and Auth are enabled

## Security

- All API keys stored in backend `.env` file (never committed to git)
- Firebase Auth for user authentication
- MongoDB queries filtered by authenticated user ID
- User data isolated per user account
- External API requires secret key authentication
- Videos stored in Firebase Storage with proper access control

## License

MIT License

## Acknowledgments

- Frontend built with [React](https://react.dev) + [Vite](https://vitejs.dev)
- Backend powered by [Node.js](https://nodejs.org) + [Express](https://expressjs.com)
- Database by [MongoDB](https://www.mongodb.com)
- Auth & Storage by [Firebase](https://firebase.google.com)
- AI by [Groq](https://groq.com) (Transcription) and [OpenAI](https://openai.com) (Summarization)
- UI components by [Shadcn](https://ui.shadcn.com)

---

**Made with ❤️ for better meetings**
