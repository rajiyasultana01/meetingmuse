# MeetingMuse Project Analysis

## Executive Summary

**MeetingMuse** is a full-stack AI-powered meeting summarization platform that transforms meeting recordings into actionable insights. The project consists of three main components:

1. **Backend API** (Node.js/Express/TypeScript)
2. **Frontend Web App** (React/TypeScript/Vite)
3. **Chrome Extension** (LexEye) for automatic meeting recording

---

## 🏗️ Architecture Overview

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Firebase Admin SDK
- **AI Services**:
  - **Groq API** with Whisper Large V3 (Transcription)
  - **OpenAI API** with GPT-4o Mini (Summarization)
- **Storage**: 
  - Primary: Firebase Storage (with fallback)
  - Fallback: Local filesystem (`backend/uploads/`)
- **Video Processing**: FFmpeg (via fluent-ffmpeg)
- **Security**: Helmet, CORS, Rate Limiting, JWT

#### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Shadcn UI (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios

#### Chrome Extension (LexEye)
- **Manifest**: V3
- **Platforms Supported**: Google Meet, Microsoft Teams, Zoom
- **Recording**: MediaRecorder API, Web Audio API
- **Format**: WebM (VP9/VP8, Opus audio)

---

## 📁 Project Structure

```
meetingmuse/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── config/         # Database & Firebase config
│   │   ├── controllers/    # Request handlers (auth, meeting, admin)
│   │   ├── middleware/     # Auth, error handling, file upload
│   │   ├── models/         # MongoDB schemas (User, Meeting, Transcript, Summary, Analytics)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic (transcription, summarization, storage)
│   │   ├── scripts/        # Utility scripts (admin setup, debugging)
│   │   └── server.ts       # Express app entry point
│   ├── uploads/            # Local video storage (fallback)
│   └── dist/               # Compiled JavaScript
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components (55 files)
│   │   ├── pages/          # Page components (17 files)
│   │   ├── hooks/          # Custom React hooks (useAuth, useToast)
│   │   ├── lib/            # Utilities (API client, JWT, utils)
│   │   ├── services/       # API service layer
│   │   └── config/         # Firebase configuration
│   └── dist/               # Production build
│
└── LexEye/                 # Chrome Extension
    ├── manifest.json       # Extension manifest
    ├── background.js      # Service worker
    ├── content.js          # Meeting detection & recording
    ├── popup.html/js       # Extension UI
    └── icons/              # Extension icons
```

---

## 🔄 Processing Pipeline

### Meeting Upload & Processing Flow

1. **Upload** (`POST /api/meetings/upload`)
   - User uploads video via web interface OR extension auto-uploads
   - File saved to local `uploads/` directory
   - Attempts Firebase Storage upload (with fallback to local)
   - Creates `Meeting` record with status: `uploaded`

2. **Processing** (Async background task)
   - Status: `uploaded` → `processing` → `transcribing`
   - FFmpeg extracts audio from video (MP3, 32kbps, mono)
   - Audio sent to Groq Whisper Large V3 API
   - Raw transcript saved to `Transcript` model

3. **Cleaning**
   - Removes filler words (uh, um, er, like)
   - Capitalizes sentences
   - Removes duplicate sentences
   - Updates `Transcript.cleanedTranscript`

4. **Summarization** (Status: `summarizing`)
   - Cleaned transcript sent to OpenAI GPT-4o Mini
   - Generates extremely detailed analysis:
     - Executive summary (500-800 words minimum)
     - Deep dive summary (1500-3000 words minimum - comprehensive meeting record)
     - Key points (all significant points with context)
     - Action items (detailed: what, who, when, why)
     - Topics (all topics with descriptions)
     - Participants mentioned
     - Coaching tips (5-8 actionable suggestions)
     - Sentiment analysis with reasoning
   - Saved to `Summary` model

5. **Completion** (Status: `completed`)
   - Creates `MeetingAnalytics` record
   - Meeting ready for viewing

### Status States
```
uploaded → processing → transcribing → summarizing → completed
                                                    ↓
                                                 failed
```

---

## 🔐 Authentication System

### Dual Authentication Architecture

The system uses a **hybrid authentication approach**:

1. **Web Frontend** (React App)
   - Uses **Firebase ID Tokens**
   - Standard Firebase Auth flow
   - Token sent in `Authorization: Bearer <token>` header

2. **Chrome Extension** (LexEye)
   - Uses **Custom Backend-Signed JWT**
   - Extension authenticates with backend
   - Backend validates Firebase credentials
   - Backend issues custom JWT for extension use
   - Allows secure background uploads without persistent Firebase SDK

### Authentication Flow

**Web:**
```
User Login → Firebase Auth → ID Token → Backend validates → Access granted
```

**Extension:**
```
Extension Login → Backend validates Firebase → Backend issues JWT → Extension uses JWT
```

---

## 💾 Data Models

### MongoDB Collections

#### User
- `firebaseUid` (unique, indexed)
- `email`, `displayName`, `photoURL`
- `role` (user/admin)

#### Meeting
- `userId`, `firebaseUid` (indexed)
- `title`, `description`
- `videoPath`, `videoUrl`, `thumbnailUrl`
- `source` (chrome-extension | manual-upload)
- `status` (uploaded | processing | transcribing | summarizing | completed | failed)
- `durationSeconds`
- `errorMessage`
- Timestamps

#### Transcript
- `meetingId`
- `rawTranscript`
- `cleanedTranscript`
- `language`
- `wordCount`

#### Summary
- `meetingId`, `transcriptId`
- `summaryText`
- `deepDiveSummary`
- `keyPoints` (array)
- `actionItems` (array with owners)
- `topics` (array)
- `participants` (array)
- `coachingTips` (array)
- `sentiment` (string)

#### MeetingAnalytics
- `meetingId`, `userId`
- `viewCount`, `shareCount`, `downloadCount`

---

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Meetings
- `POST /api/meetings/upload` - Upload meeting video (multipart/form-data)
- `GET /api/meetings` - Get user's meetings
- `GET /api/meetings/:id` - Get meeting details (with transcript & summary)
- `DELETE /api/meetings/:id` - Delete meeting

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/meetings` - List all meetings
- `GET /api/admin/analytics` - Get analytics
- `PUT /api/admin/users/:userId/role` - Update user role

### External API (for extensions/integrations)
- `POST /api/external/receive-recording` - Receive recording (requires `x-api-key` header)
  - Supports Base64 video or video URL
  - Creates meeting record and triggers processing

---

## 🎨 Frontend Features

### Pages
1. **Home** - Landing page
2. **Login/Signup** - Authentication
3. **UserDashboard** - User's meeting overview
4. **MeetingsList** - All user meetings
5. **MeetingDetail** - Meeting details with transcript, summary, insights
6. **MeetingPlayer** - Video player page
7. **SummarizeMeeting** - Upload & process new meeting
8. **Admin Dashboard** - Admin analytics & management
9. **Admin Pages** - User management, meeting management, analytics

### Key Components
- **MeetingReport** - Displays summary, action items, key points
- **AppSidebar** - Navigation sidebar
- **Header** - Top navigation bar
- **Layout** - Main layout wrapper
- **55+ UI Components** - Shadcn UI components (buttons, dialogs, cards, etc.)

---

## 🔌 Chrome Extension (LexEye)

### Features
- **Automatic Meeting Detection** - Detects Teams/Meet/Zoom meetings
- **Auto-Recording** - Optional automatic recording on meeting join
- **High-Quality Recording** - 1920x1080, 30fps, VP9/VP8
- **Audio Mixing** - Combines meeting audio + microphone
- **MeetingMuse Integration** - Auto-upload to backend
- **Local Storage** - Saves to Downloads folder

### Technical Details
- **Manifest V3** - Modern Chrome extension architecture
- **Content Script** - Monitors DOM for meeting detection
- **Background Service Worker** - Handles recording logic
- **MediaRecorder API** - Video encoding
- **Web Audio API** - Audio mixing

### Known Limitations
- **Microphone Access**: User's voice may not be captured if mic is already in use by meeting
- **Workaround**: Start recording BEFORE joining meeting

---

## 🔒 Security Features

1. **Authentication**
   - Firebase Auth for web
   - Custom JWT for extensions
   - Middleware validates all protected routes

2. **Authorization**
   - User data isolated by `firebaseUid`
   - Admin routes protected by role check
   - MongoDB queries filtered by user ID

3. **API Security**
   - Rate limiting (100 requests/15min per IP)
   - Helmet.js security headers
   - CORS configuration
   - External API requires secret key

4. **Data Protection**
   - Videos stored in Firebase Storage (access controlled)
   - Local fallback for resilience
   - No API keys exposed to frontend

---

## 🚀 Deployment

### Current Deployment (Based on Documentation)
- **Frontend**: Render.com (or Vercel/Netlify)
- **Backend**: Render.com (or Railway/Heroku)
- **Database**: MongoDB Atlas
- **Storage**: Firebase Storage
- **Auth**: Firebase

### Environment Variables

**Backend:**
- `PORT`, `NODE_ENV`
- `MONGODB_URI`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `GROQ_API_KEY` (for transcription)
- `OPENAI_API_KEY` (for summarization)
- `API_SECRET_KEY` (for external API)
- `CORS_ORIGIN`

**Frontend:**
- `VITE_API_URL` (backend API URL)

---

## 📊 Key Metrics & Costs

### Processing Costs (per 30-minute meeting)
- **Transcription**: ~$0.18 (Groq Whisper)
- **Summarization**: ~$0.05-0.08 (OpenAI GPT-4o Mini with detailed summaries)
- **Total**: ~$0.23-0.26 per meeting

### Storage
- Videos stored in Firebase Storage (pay-as-you-go)
- Local fallback in `backend/uploads/` (server storage)

---

## ⚠️ Issues & Inconsistencies Found

### 1. ~~README Merge Conflicts~~ ✓ FIXED
- ~~**Location**: `README.md`~~
- ~~**Issue**: Contains Git merge conflict markers~~
- **Status**: All merge conflicts resolved, documentation consolidated

### 2. ~~AI Service Documentation Mismatch~~ ✓ FIXED
- ~~**Issue**: README mentions "OpenAI Whisper" but code uses "Groq Whisper"~~
- **Status**: Documentation now correctly reflects Groq for transcription and OpenAI for summarization

### 3. ~~Deployment Guide Mentions Gemini~~ ✓ FIXED
- ~~**Location**: `DEPLOYMENT_GUIDE.md`~~
- ~~**Issue**: Mentions "Google Gemini 1.5 Flash" but code uses Groq~~
- **Status**: Updated to reflect correct AI services (Groq Whisper + OpenAI GPT-4o Mini)

### 4. ~~Duplicate dotenv.config() Calls~~ ✓ FIXED
- ~~**Location**: `backend/src/server.ts` (lines 17 & 20)~~
- ~~**Issue**: `dotenv.config()` called twice~~
- **Status**: Duplicate call removed

### 5. Large Upload Size Limit
- **Location**: `backend/src/server.ts` (line 74-75)
- **Issue**: Body parser limit set to `5gb` (very large)
- **Impact**: Potential memory issues
- **Recommendation**: Consider using streaming for large uploads or reasonable limit (e.g., 500MB)

---

## 🎯 Strengths

1. **Robust Architecture**
   - Clean separation of concerns
   - Well-structured MVC pattern
   - TypeScript for type safety

2. **Resilient Storage**
   - Automatic fallback to local storage
   - No data loss on Firebase failures

3. **Comprehensive Features**
   - Web interface + Chrome extension
   - Admin dashboard
   - Analytics tracking

4. **Modern Tech Stack**
   - Latest React patterns
   - Shadcn UI for beautiful components
   - React Query for data fetching

5. **Security Conscious**
   - Multiple authentication methods
   - Rate limiting
   - CORS protection
   - User data isolation

---

## 🔮 Potential Improvements

1. **Documentation**
   - Resolve merge conflicts in README
   - Update AI service references
   - Add API documentation (Swagger/OpenAPI)

2. **Error Handling**
   - More detailed error messages
   - Better error recovery
   - Retry logic for API calls

3. **Performance**
   - Implement video streaming for large files
   - Add caching layer
   - Optimize database queries

4. **Testing**
   - Unit tests for services
   - Integration tests for API
   - E2E tests for critical flows

5. **Monitoring**
   - Add logging service (Winston/Pino)
   - Error tracking (Sentry)
   - Performance monitoring

6. **Features**
   - Speaker diarization (identify different speakers)
   - Multi-language support
   - Email notifications
   - Export to PDF/DOCX
   - Calendar integration

---

## 📝 Development Workflow

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev  # Uses tsx watch for hot reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

**Extension:**
1. Load `LexEye/` folder in Chrome Extensions (Developer Mode)
2. Pin extension to toolbar
3. Test on Teams/Meet/Zoom

### Production Build

**Backend:**
```bash
cd backend
npm run build  # Compiles TypeScript to dist/
npm start      # Runs compiled JavaScript
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates dist/ folder
# Deploy dist/ to hosting service
```

---

## 🎓 Learning Resources

The project demonstrates:
- Full-stack TypeScript development
- Firebase integration (Auth + Storage)
- MongoDB with Mongoose
- AI API integration (Groq)
- Chrome Extension development (Manifest V3)
- React with modern patterns (Hooks, Context, Query)
- File upload handling
- Background job processing
- Error handling & resilience

---

## 📞 Support & Resources

- **Main README**: `README.md` (needs merge conflict resolution)
- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **Extension README**: `LexEye/README.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Project Update**: `PROJECT_UPDATE.md`

---

## ✅ Conclusion

MeetingMuse is a **well-architected, production-ready** application with:
- ✅ Clean code structure
- ✅ Modern tech stack
- ✅ Comprehensive features
- ✅ Security best practices
- ⚠️ Some documentation inconsistencies (easily fixable)
- ⚠️ Minor code quality issues (duplicate calls, large limits)

The project is **ready for production use** after resolving the documentation issues and minor code improvements.

---

*Analysis generated on: $(date)*
*Project: MeetingMuse - AI-Powered Meeting Summarization*

