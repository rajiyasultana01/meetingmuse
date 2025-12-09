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
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: Firebase Auth (Frontend), Custom JWT (Backend-Extension)
- **AI Services**:
  - OpenAI Whisper API (Transcription)
  - Groq API (Summarization)
- **Storage**: Firebase Storage (Primary), Local Filesystem (Fallback)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (Running locally or Atlas URI)
- FFmpeg (Installed and added to PATH)
- Firebase Project (Project ID, Service Account)
- OpenAI API Key

### 1. Backend Setup

```bash
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
```
Access the dashboard at `http://localhost:8080`.

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

### Storage Fallback
To ensure no recording is ever lost:
1. The system attempts to upload to Firebase Storage.
2. If network/config fails, it automatically saves the file to the local server (`backend/uploads`).
3. The video remains accessible via a local static URL.

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
