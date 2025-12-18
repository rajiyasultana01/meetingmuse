# MeetingMuse Deployment Guide

## Architecture
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express (API Server)
- **Database**: MongoDB Atlas
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage (with local fallback)
- **AI Processing**: Groq Whisper Large V3 (Transcription) + OpenAI GPT-4o Mini (Summarization)

## Environment Variables

### Backend
| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production` |
| `PORT` | `5000` (default) |
| `MONGODB_URI` | Connection string for MongoDB Atlas |
| `GROQ_API_KEY` | **Required** for transcription. Get from [console.groq.com](https://console.groq.com) |
| `OPENAI_API_KEY` | **Required** for summarization. Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `FIREBASE_PROJECT_ID` | From Firebase Service Account |
| `FIREBASE_CLIENT_EMAIL` | From Firebase Service Account |
| `FIREBASE_PRIVATE_KEY` | Full private key (including `-----BEGIN...`) |
| `CORS_ORIGIN` | Frontend URL (e.g., https://yourapp.com) |
| `API_SECRET_KEY` | Secret key for external API authentication |

### Frontend
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Backend API URL (e.g., https://api.yourapp.com/api) |
| `VITE_FIREBASE_*` | Firebase config (if using env vars, otherwise hardcoded in `src/config/firebase.ts`) |

## Deployment Platforms

### Option 1: Render.com

#### Backend
1. Create new Web Service
2. Connect your repository
3. Configure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Add all environment variables from the table above

#### Frontend
1. Create new Static Site
2. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Add environment variables
3. Add rewrite rule for SPA routing:
   - Create `frontend/public/_redirects`:
     ```
     /* /index.html 200
     ```

### Option 2: Railway

#### Backend
1. Create new project from GitHub repo
2. Add environment variables
3. Railway auto-detects Node.js and runs the app

#### Frontend
1. Deploy to Vercel or Netlify (see below)

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Backend on Railway
Follow Railway instructions above

#### Frontend on Vercel
1. Connect GitHub repository
2. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables

## MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (Free M0 tier available)
3. Database Access → Add User
4. Network Access → Add IP (0.0.0.0/0 for all IPs, or specific deployment IPs)
5. Get connection string from "Connect" button

## Firebase Setup

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication:
   - Authentication → Sign-in method → Email/Password → Enable
3. Enable Storage:
   - Storage → Get Started
4. Generate Service Account:
   - Project Settings → Service Accounts → Generate new private key
   - Extract:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY`

## Groq API Setup (Transcription)

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Create API key
4. Free tier: 60 requests/minute
5. Add to `GROQ_API_KEY` env variable

## OpenAI API Setup (Summarization)

1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up / Log in
3. Create API key
4. Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens (GPT-4o Mini)
5. Add to `OPENAI_API_KEY` env variable

## Key Features & Fixes

1. **Hybrid AI Processing**: Uses Groq Whisper for fast transcription and OpenAI GPT-4o Mini for high-quality summarization
2. **FFmpeg Required**: Make sure FFmpeg is installed on deployment platform (Render has it by default)
3. **Video Playback**: Frontend automatically rewrites `localhost` URLs to production URLs
4. **SPA Routing**: Redirect rules configured to support React Router on page refresh

## Troubleshooting

### 401 Unauthorized
- Check `FIREBASE_PRIVATE_KEY` in Backend environment variables. It must be exact (including newlines).
- Ensure Frontend is waiting for Auth state before making requests.

### Processing Stuck
- Ensure `GROQ_API_KEY` and `OPENAI_API_KEY` are set correctly
- Check backend logs for FFmpeg errors
- Verify MongoDB connection
- Check OpenAI API rate limits and quota

### FFmpeg Not Found
- Render: FFmpeg is pre-installed
- Railway: Add buildpack or install in Dockerfile
- Heroku: Add `heroku-buildpack-ffmpeg-latest` buildpack

### CORS Errors
- Verify `CORS_ORIGIN` matches your frontend URL
- Check that frontend is using correct `VITE_API_URL`

## Admin Setup

After deployment, create an admin user:

1. SSH into backend or use Railway CLI
2. Run: `npm run setup-admin`
3. Follow prompts to enter Firebase user ID
4. User will be granted admin role

## Cost Estimates

**Free Tier:**
- MongoDB Atlas: 512MB storage
- Groq: 60 requests/minute (Transcription)
- Firebase: 1GB storage, 50K reads/day
- Render/Railway: Free tier with limitations

**Paid:**
- Render: $7/month (backend) + $0 (static site)
- Railway: Usage-based (~$5-10/month)
- MongoDB Atlas: $0 (M0) or $9/month (M2)
- OpenAI: Pay-as-you-go (~$0.05-0.08 per 30-min meeting for detailed summaries)

## Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Firebase Auth and Storage enabled
- [ ] Groq API key added (transcription)
- [ ] OpenAI API key added (summarization)
- [ ] CORS origin set to production URL
- [ ] Frontend API URL updated
- [ ] Admin user created
- [ ] SPA redirect rules configured
- [ ] SSL/HTTPS enabled (automatic on Render/Vercel)
- [ ] Test video upload and processing
