# MeetingMuse - AI-Powered Meeting Summarization

Transform your meeting recordings into actionable insights with AI-powered transcription and intelligent summarization.

![MeetingMuse](frontend/public/og-image.png)

## Features

- **AI-Powered Transcription** - Automatic speech-to-text using OpenAI Whisper
- **Intelligent Summarization** - Generate comprehensive summaries with Groq LLaMA 3.3
- **Dual Upload Methods**
  - **Web Interface**: Monitor and manage meetings.
  - **Chrome Extension (LexEye)**: Automatically record and upload directly from Google Meet, Zoom, and Teams.
- **Smart Insights**
  - Action Items Extraction
  - Key Points & Statistics
  - Sentiment Analysis
  - Participant Tracking
- **Robust Architecture**
  - **Dual Authentication**: Secure Firebase Login for Web + Custom JWT implementation for Extension communication.
  - **Resilient Storage**: Automatic fallback to local storage if Cloud Storage fails.
  - **Real-time Status**: Track uploading, transcribing, and processing states.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
<<<<<<< HEAD
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Services**:
  - OpenAI Whisper API (transcription)
  - Groq API with LLaMA 3.3 70B (summarization)
- **Deployment**: MongoDB Atlas (database), Firebase (auth/storage), Vercel/Netlify (frontend), any Node.js host (backend)
=======
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: Firebase Auth (Frontend), Custom JWT (Backend-Extension)
- **AI Services**:
  - OpenAI Whisper API (Transcription)
  - Groq API (Summarization)
- **Storage**: Firebase Storage (Primary), Local Filesystem (Fallback)
>>>>>>> 9b86033 (Cleanup documentation and fix frontend meeting details)

## Quick Start

### Prerequisites

- Node.js 18+
<<<<<<< HEAD
- MongoDB (local or MongoDB Atlas)
- Firebase account (for Auth and Storage)
- OpenAI API key
- Groq API key (free tier available)
=======
- MongoDB (Running locally or Atlas URI)
- FFmpeg (Installed and added to PATH)
- Firebase Project (Project ID, Service Account)
- OpenAI API Key
>>>>>>> 9b86033 (Cleanup documentation and fix frontend meeting details)

### 1. Backend Setup

```bash
<<<<<<< HEAD
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
=======
cd backend
npm install

# Create .env file
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/meetingmuse
# FIREBASE_PROJECT_ID=your-project-id
# OPENAI_API_KEY=sk-...
# GROQ_API_KEY=gsk_...
# API_SECRET_KEY=your-secret-key-for-extension

npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
>>>>>>> 9b86033 (Cleanup documentation and fix frontend meeting details)
```
Access the dashboard at `http://localhost:8080`.

<<<<<<< HEAD
3. **Update Firebase config:**
   - Edit `frontend/src/config/firebase.ts` with your Firebase credentials

4. **Start the frontend:**
```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:8080` (or 8081 if 8080 is in use)
=======
### 3. Extension Setup (LexEye)

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `LexEye` directory.
4. Pin the extension.
5. Log in using your MeetingMuse credentials.

## Architecture Highlights

### Dual Authentication System
The system uses a hybrid authentication approach:
- **Web Frontend**: Uses Standard Firebase ID Tokens.
- **Browser Extension**: Uses a custom backend-signed JWT mechanism to allow secure background uploads without persistent Firebase SDK instances in content scripts.
>>>>>>> 9b86033 (Cleanup documentation and fix frontend meeting details)

### Storage Fallback
To ensure no recording is ever lost:
1. The system attempts to upload to Firebase Storage.
2. If network/config fails, it automatically saves the file to the local server (`backend/uploads`).
3. The video remains accessible via a local static URL.

<<<<<<< HEAD
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
=======
### API Processing Pipeline
1. **Receive**: Video uploaded via Stream/File.
2. **Transcribe**: Audio extracted via FFmpeg -> OpenAI Whisper.
3. **Summarize**: Transcript cleaned -> Groq LLaMA 3.3.
4. **Persist**: Results saved to MongoDB.

## Development

- **Backend Logs**: Check the backend terminal for detailed processing logs (`[Auth]`, `[Upload]`, `Processing meeting...`).
- **Local Videos**: Stored in `backend/uploads/` if cloud upload fails.

## Troubleshooting

- **"Processing in progress..."**: The backend is running FFmpeg/OpenAI tasks. This can take 1-5 minutes depending on video length.
- **Login fails in Extension**: Ensure the backend is running and `localhost` SSL/CORS is allowed.
- **Extension "Network Error"**: Check if `localhost:5000` is reachable.

## License

MIT License.
>>>>>>> 9b86033 (Cleanup documentation and fix frontend meeting details)
