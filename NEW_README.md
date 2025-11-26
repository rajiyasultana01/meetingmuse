# MeetingMind - AI-Powered Meeting Summarization
## Firebase + MongoDB Edition

Transform your meeting recordings into actionable insights with AI-powered transcription and intelligent summarization.

## 🎉 What's New

This version has been completely rebuilt with:
- ✅ **Firebase Authentication** - Secure user management
- ✅ **MongoDB** - Flexible NoSQL database
- ✅ **Node.js/Express Backend** - Full REST API
- ✅ **TypeScript** - Type-safe codebase
- ✅ **Firebase Cloud Storage** - Reliable file storage

## Features

- **AI-Powered Transcription** - Automatic speech-to-text using OpenAI Whisper
- **Intelligent Summarization** - Generate comprehensive summaries with Groq LLaMA 3.3
- **Action Items Extraction** - Automatically identify and list action items
- **Key Points & Topics** - Extract main discussion points and topics
- **Sentiment Analysis** - Understand the overall meeting tone
- **Video Playback** - Watch recordings with timestamp navigation
- **User & Admin Dashboards** - Manage meetings and users
- **Real-time Processing** - Track status: uploading → transcribing → summarizing → completed
- **External API** - Integrate with screen recording software

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + Shadcn UI
- Firebase SDK (Authentication)
- Axios (API client)
- React Router
- TanStack Query

### Backend
- Node.js 18+
- Express
- TypeScript
- Firebase Admin SDK
- Mongoose (MongoDB ODM)
- OpenAI API (Whisper)
- Groq SDK (LLaMA 3.3)
- Multer (file uploads)

### Infrastructure
- Firebase Authentication
- Firebase Cloud Storage
- MongoDB (local or Atlas)
- OpenAI Whisper API
- Groq API

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase account
- MongoDB (local or Atlas)
- OpenAI API key
- Groq API key

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase config

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:8080`

### 3. Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Enable Cloud Storage
4. Get web app config
5. Generate service account key (for backend)

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

### 4. MongoDB Setup

**Local MongoDB:**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb
```

**MongoDB Atlas:**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Get connection string

### 5. API Keys

**OpenAI (Whisper):**
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to backend `.env`

**Groq (LLaMA):**
1. Visit [console.groq.com](https://console.groq.com)
2. Create API key (free tier available)
3. Add to backend `.env`

## Project Structure

```
meeting_muse/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Firebase, MongoDB config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, upload, error handlers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # React application
│   ├── src/
│   │   ├── config/        # Firebase config
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks (useAuth)
│   │   ├── lib/           # API client
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
├── MIGRATION_GUIDE.md     # Detailed setup guide
└── README.md              # This file
```

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Meetings
- `POST /api/meetings/upload` - Upload meeting video
- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/:id` - Get meeting details
- `DELETE /api/meetings/:id` - Delete meeting

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/meetings` - Get all meetings
- `GET /api/admin/analytics` - Get analytics
- `PUT /api/admin/users/:userId/role` - Update user role

### External API
- `POST /api/external/receive-recording` - Receive recording from external system

## Authentication

The application uses Firebase Authentication with custom token management:

```typescript
// Frontend - Login
import { useAuth } from '@/hooks/useAuth';
const { login } = useAuth();
await login(email, password);

// API calls are automatically authenticated
import { meetingsAPI } from '@/lib/api';
const meetings = await meetingsAPI.getAll();
```

## Database Models

### User
- Firebase UID (unique)
- Email
- Display name
- Photo URL
- Role (user/admin)

### Meeting
- User ID
- Title, description
- Video path/URL
- Status (uploaded/processing/completed/failed)
- Duration

### Transcript
- Meeting ID
- Raw transcript
- Cleaned transcript
- Language
- Word count

### Summary
- Meeting ID, Transcript ID
- Summary text
- Key points
- Action items
- Topics
- Participants
- Sentiment

## Processing Pipeline

1. **Upload** → Video uploaded to Firebase Storage
2. **Transcription** → OpenAI Whisper extracts speech-to-text
3. **Cleaning** → Remove filler words, fix formatting
4. **Summarization** → Groq LLaMA generates insights
5. **Storage** → Save to MongoDB
6. **Display** → Present in user dashboard

## External API Integration

Integrate with screen recording software:

```bash
curl -X POST http://localhost:5000/api/external/receive-recording \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_SECRET_KEY" \
  -d '{
    "videoUrl": "https://example.com/recording.mp4",
    "fileName": "meeting.mp4",
    "title": "Team Standup",
    "userId": "firebase-user-uid"
  }'
```

## Development

```bash
# Backend development
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Run production build

# Frontend development
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment

### Backend (Railway/Render/Heroku)
1. Connect Git repository
2. Set environment variables
3. Build: `npm run build`
4. Start: `npm start`

### Frontend (Vercel/Netlify)
1. Connect Git repository
2. Set environment variables
3. Build: `npm run build`
4. Output: `dist/`

### MongoDB Production
Use MongoDB Atlas:
- Free M0 cluster (512MB)
- Automatic backups
- Global replication
- Built-in monitoring

## Cost Estimates

For 100 meetings/month (avg 30min each):

| Service | Cost |
|---------|------|
| Firebase Auth | Free |
| Firebase Storage (5GB) | ~$0.13 |
| MongoDB Atlas M0 | Free |
| OpenAI Whisper | ~$18 |
| Groq API | Free |
| Hosting | $0-5 |
| **Total** | **~$18-23/month** |

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meetingmind
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
API_SECRET_KEY=random-secret
CORS_ORIGIN=http://localhost:8080
```

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Backend Issues

**MongoDB connection failed:**
- Check `MONGODB_URI`
- Ensure MongoDB is running
- For Atlas: verify IP whitelist

**Firebase auth error:**
- Verify private key format (includes `\n`)
- Check project ID matches
- Ensure service account permissions

### Frontend Issues

**Firebase not configured:**
- Check all `VITE_FIREBASE_*` variables
- Restart dev server after `.env` changes

**API calls failing:**
- Ensure backend is running
- Check `VITE_API_URL`
- Verify CORS settings

### Processing Errors

**Transcription fails:**
- Verify OpenAI API key
- Check API credits
- Ensure video format supported

**Summary fails:**
- Verify Groq API key
- Check rate limits
- Review backend logs

## Security

- Firebase Admin SDK for server-side auth
- JWT tokens auto-managed by Firebase
- MongoDB user isolation via RLS
- API key authentication for external APIs
- Secure file uploads to Firebase Storage
- Environment variables for secrets
- CORS configuration
- Rate limiting on API endpoints

## Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Complete setup guide
- [backend/README.md](./backend/README.md) - Backend API docs
- [API_INTEGRATION.md](./API_INTEGRATION.md) - External API guide

## Support

For issues:
1. Check backend logs
2. Check browser console
3. Review MongoDB logs
4. Check Firebase Console
5. See MIGRATION_GUIDE.md

## License

MIT License

## Acknowledgments

- Built with [React](https://react.dev) + [Vite](https://vitejs.dev)
- Powered by [Firebase](https://firebase.google.com) + [MongoDB](https://www.mongodb.com)
- AI by [OpenAI](https://openai.com) + [Groq](https://groq.com)
- UI by [Shadcn](https://ui.shadcn.com)

---

**Made with ❤️ for better meetings**
