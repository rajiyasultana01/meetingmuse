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
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Services**:
  - OpenAI Whisper API (transcription)
  - Groq API with LLaMA 3.3 70B (summarization)
- **Deployment**: MongoDB Atlas (database), Firebase (auth/storage), Vercel/Netlify (frontend), any Node.js host (backend)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Firebase account (for Auth and Storage)
- OpenAI API key
- Groq API key (free tier available)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd meeting_muse

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Backend Setup

1. **Configure MongoDB:**
   - Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string

2. **Configure Firebase:**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password provider)
   - Enable Cloud Storage
   - Generate a service account key (Settings → Service Accounts → Generate new private key)

3. **Create `backend/.env` file:**
```bash
PORT=5000
NODE_ENV=development

MONGODB_URI=your-mongodb-connection-string

API_SECRET_KEY=your-random-secret-key
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
CORS_ORIGIN=http://localhost:8080

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

4. **Start the backend server:**
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Configure Firebase in frontend:**
   - Copy your Firebase config from Firebase Console → Project Settings → General

2. **Create `frontend/.env` file:**
```bash
VITE_API_URL=http://localhost:5000/api
```

3. **Update Firebase config:**
   - Edit `frontend/src/config/firebase.ts` with your Firebase credentials

4. **Start the frontend:**
```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:8080` (or 8081 if 8080 is in use)

## Usage

### User Upload

1. Sign up / Login
2. Navigate to "Summarize Meeting"
3. Upload a meeting video (MP4, MOV, AVI - max 100MB)
4. Wait for processing (2-5 minutes typically)
5. View transcript, summary, action items, and insights

### External API Integration

Integrate with screen recording software or Chrome extensions to automatically process recordings.

**Endpoint:**
```
POST http://your-backend-url:5000/api/external/receive-recording
```

**Headers:**
```
Content-Type: application/json
x-api-key: YOUR_API_SECRET_KEY
```

**Request Body (Base64):**
```json
{
  "video": "base64_encoded_video",
  "fileName": "meeting.mp4",
  "title": "Team Standup",
  "userId": "firebase-user-id",
  "metadata": {
    "duration": 1800,
    "participants": ["Alice", "Bob"]
  }
}
```

**Request Body (URL):**
```json
{
  "videoUrl": "https://example.com/recording.mp4",
  "fileName": "meeting.mp4",
  "title": "Sprint Planning",
  "userId": "firebase-user-id"
}
```

See [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API documentation.

## Processing Pipeline

1. **Upload** - Video uploaded to Firebase Storage and saved locally
2. **Transcription** - OpenAI Whisper extracts speech-to-text
3. **Cleaning** - Remove filler words, fix formatting
4. **Summarization** - Groq LLaMA generates:
   - Meeting summary
   - Key points discussed
   - Action items with owners
   - Main topics
   - Sentiment analysis
   - Participant mentions
5. **Storage** - Save to MongoDB
6. **Display** - Present in user dashboard

## Project Structure

```
meeting_muse/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API client & utilities
│   │   ├── config/        # Firebase configuration
│   │   └── hooks/         # Custom React hooks
│   └── public/
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (AI, storage)
│   │   ├── middleware/    # Auth & error handling
│   │   └── config/        # Database & Firebase config
│   └── uploads/           # Temporary video storage
├── SETUP.md              # Detailed setup guide
├── API_INTEGRATION.md    # API documentation
└── README.md             # This file
```

## Database Schema (MongoDB)

**Main Collections:**
- `users` - User profiles (synced with Firebase Auth)
- `meetings` - Meeting records with status tracking
- `transcripts` - Raw and cleaned transcripts
- `summaries` - AI-generated summaries with extracted insights
- `meetinganalytics` - View/share/download tracking

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

Add all to your backend `.env` file:
```bash
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
API_SECRET_KEY=your-secret
```

## Cost Estimates

For a 30-minute meeting:
- **Transcription**: ~$0.18 (Whisper)
- **Summarization**: Free tier or ~$0.02 (Groq)
- **Total**: ~$0.20 per meeting

## Development

### Run Locally

```bash
# Backend
cd backend
npm run dev

# Frontend (in a new terminal)
cd frontend
npm run dev
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## Deployment

### Frontend
Deploy to Vercel or Netlify:
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend
Deploy to any Node.js hosting platform (Heroku, Railway, DigitalOcean, etc.):
```bash
cd backend
npm run build
npm start
```

Configure environment variables in your hosting platform's dashboard.

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
- Verify OpenAI and Groq API keys are set correctly
- Ensure video format is supported
- Check MongoDB connection

### Database connection errors
- Verify MongoDB URI in backend `.env`
- Check if MongoDB Atlas allows connections from your IP
- Ensure MongoDB cluster is running

### API authentication fails
- Verify `x-api-key` header matches backend `.env`
- Check Firebase Auth token is valid
- Ensure user exists in MongoDB

### Firebase errors
- Verify Firebase credentials in backend `.env`
- Check Firebase project settings
- Ensure Storage and Auth are enabled

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## Security

- All API keys stored in backend `.env` file (never committed to git)
- Firebase Auth for user authentication
- MongoDB queries filtered by authenticated user ID
- User data isolated per user account
- External API requires secret key authentication
- Videos stored in Firebase Storage with proper access control

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

- Frontend built with [React](https://react.dev) + [Vite](https://vitejs.dev)
- Backend powered by [Node.js](https://nodejs.org) + [Express](https://expressjs.com)
- Database by [MongoDB](https://www.mongodb.com)
- Auth & Storage by [Firebase](https://firebase.google.com)
- AI by [OpenAI](https://openai.com) and [Groq](https://groq.com)
- UI components by [Shadcn](https://ui.shadcn.com)

---

**Made with ❤️ for better meetings**
