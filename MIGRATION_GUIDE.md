# MeetingMind Migration Guide
## From Supabase to Firebase + MongoDB

This guide will help you migrate from the Supabase backend to Firebase Authentication with MongoDB and a Node.js/Express backend.

## Architecture Overview

### Before (Supabase)
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)

### After (Firebase + MongoDB)
- **Auth**: Firebase Authentication
- **Database**: MongoDB (local or Atlas)
- **Storage**: Firebase Cloud Storage
- **Backend**: Node.js + Express + TypeScript

## Prerequisites

1. **Node.js 18+** installed
2. **Firebase Account** (free tier works)
3. **MongoDB** (local installation or MongoDB Atlas account)
4. **OpenAI API Key** (for Whisper transcription)
5. **Groq API Key** (for AI summarization - free tier available)

## Step-by-Step Migration

### Part 1: Firebase Setup

#### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "meetingmind")
4. Disable Google Analytics (optional)
5. Click "Create project"

#### 1.2 Enable Firebase Authentication

1. In Firebase Console → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Save

#### 1.3 Get Firebase Web Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app (name: "MeetingMind Web")
5. Copy the Firebase config values:
   ```js
   {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:123:web:abc123"
   }
   ```

#### 1.4 Get Firebase Admin SDK Credentials

1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract these values for later:
   - `project_id`
   - `private_key`
   - `client_email`

#### 1.5 Enable Firebase Storage

1. Go to **Storage** in Firebase Console
2. Click "Get started"
3. Select "Start in production mode"
4. Choose a location (e.g., us-central1)
5. Click "Done"

### Part 2: MongoDB Setup

Choose **Option A** (Local) or **Option B** (Cloud):

#### Option A: Local MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download MongoDB from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Install and run as a service

**Linux:**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Connection string: `mongodb://localhost:27017/meetingmind`

#### Option B: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Sign in
3. Create a **free cluster** (M0)
4. Choose cloud provider and region
5. Click "Create Cluster"
6. Wait for cluster to deploy (2-5 minutes)
7. Click "Connect"
8. Add your IP address to whitelist (or allow from anywhere: `0.0.0.0/0`)
9. Create a database user with password
10. Get connection string:
    ```
    mongodb+srv://username:password@cluster.mongodb.net/meetingmind
    ```

### Part 3: Backend Setup

#### 3.1 Install Dependencies

```bash
cd backend
npm install
```

#### 3.2 Configure Environment Variables

Create `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/meetingmind
# Or Atlas: mongodb+srv://username:password@cluster.mongodb.net/meetingmind

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# AI APIs
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...

# External API Secret
API_SECRET_KEY=your-random-secret-key-here

# CORS Origin
CORS_ORIGIN=http://localhost:8080

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
```

**Important Notes:**
- Replace `FIREBASE_PRIVATE_KEY` with the actual private key from the JSON file
- Keep the `\n` characters in the private key
- Generate a strong `API_SECRET_KEY`: `openssl rand -base64 32`

#### 3.3 Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Server will run on `http://localhost:5000`

### Part 4: Frontend Setup

#### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 4.2 Configure Environment Variables

Create `frontend/.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:123:web:abc123

# Backend API
VITE_API_URL=http://localhost:5000/api
```

Use the Firebase config values from **Part 1, Step 1.3**.

#### 4.3 Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

### Part 5: Testing the System

#### 5.1 Test Authentication

1. Open `http://localhost:8080`
2. Click "Sign Up"
3. Create a new account
4. Verify you can log in
5. Check backend logs to see user created in MongoDB

#### 5.2 Test Meeting Upload

1. Log in to the application
2. Navigate to "Summarize Meeting"
3. Upload a short test video (< 5MB recommended for first test)
4. Click "Generate AI Summary"
5. Monitor backend logs for progress:
   - Upload → Transcribing → Summarizing → Completed
6. View the generated summary

#### 5.3 Verify Database

**MongoDB:**
```bash
# Local MongoDB
mongosh
use meetingmind
db.users.find()
db.meetings.find()
db.transcripts.find()
db.summaries.find()
```

**MongoDB Atlas:**
- Go to your cluster → Collections
- Browse `meetingmind` database
- Check `users`, `meetings`, `transcripts`, `summaries` collections

## Data Migration (Optional)

If you have existing data in Supabase that you want to migrate:

### Export from Supabase

```sql
-- Export users
COPY profiles TO '/tmp/profiles.csv' WITH CSV HEADER;

-- Export meetings
COPY meetings TO '/tmp/meetings.csv' WITH CSV HEADER;

-- Export transcripts
COPY transcripts TO '/tmp/transcripts.csv' WITH CSV HEADER;

-- Export summaries
COPY summaries TO '/tmp/summaries.csv' WITH CSV HEADER;
```

### Import to MongoDB

Create a migration script:

```javascript
// scripts/migrate-data.js
import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import { User, Meeting, Transcript, Summary } from '../src/models/index.js';

// Read CSV and import to MongoDB
// Implement based on your CSV structure
```

## API Endpoint Changes

### Authentication

**Before (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';
await supabase.auth.signInWithPassword({ email, password });
```

**After (Firebase):**
```typescript
import { useAuth } from '@/hooks/useAuth';
const { login } = useAuth();
await login(email, password);
```

### Meetings API

**Before (Supabase):**
```typescript
const { data } = await supabase.from('meetings').select('*');
```

**After (Express Backend):**
```typescript
import { meetingsAPI } from '@/lib/api';
const { data } = await meetingsAPI.getAll();
```

## Troubleshooting

### Backend Won't Start

**Error: MongoDB connection failed**
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running (local) or accessible (Atlas)
- For Atlas: Check IP whitelist and credentials

**Error: Firebase auth error**
- Verify `FIREBASE_PRIVATE_KEY` includes `\n` characters
- Check `FIREBASE_PROJECT_ID` matches your project
- Ensure service account has proper permissions

### Frontend Issues

**Error: Firebase not configured**
- Check all `VITE_FIREBASE_*` variables are set in `.env`
- Restart dev server after changing `.env`

**Error: API calls failing**
- Ensure backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend

### Video Upload Fails

**Error: File too large**
- Increase `MAX_FILE_SIZE` in backend `.env`
- Check Firebase Storage quota

**Error: Transcription fails**
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API credits
- Ensure video format is supported (MP4, MOV, AVI)

### Summary Generation Fails

**Error: Groq API error**
- Verify `GROQ_API_KEY` is correct
- Check Groq rate limits (free tier has limits)
- Review backend logs for detailed error

## Production Deployment

### Backend Deployment

**Recommended Platforms:**
- **Railway**: Automatic deployments from Git
- **Render**: Free tier available
- **Heroku**: Easy deployment
- **DigitalOcean**: Full control with VPS

**Environment Variables:**
Set all variables from `backend/.env` in your hosting platform.

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

### Frontend Deployment

**Recommended Platforms:**
- **Vercel**: Best for React/Vite apps
- **Netlify**: Easy setup
- **Firebase Hosting**: Integrated with Firebase

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist/
```

### MongoDB Production

**For Production:**
- Use **MongoDB Atlas** (free M0 cluster or paid tiers)
- Enable authentication
- Configure IP whitelist properly
- Use connection pooling
- Enable backups

## Cost Comparison

### Before (Supabase)
- Free tier: 500MB database, 1GB storage
- Pro tier: $25/month

### After (Firebase + MongoDB)
| Service | Free Tier | Cost (estimated) |
|---------|-----------|------------------|
| Firebase Auth | 50,000 MAU | Free |
| Firebase Storage | 5GB | $0.026/GB |
| MongoDB Atlas | 512MB | Free (M0 cluster) |
| OpenAI Whisper | Pay-per-use | ~$0.18 per 30min |
| Groq API | Generous free tier | Free or ~$0.02 per summary |
| Hosting (Railway/Render) | Free tier available | $0-5/month |

**Estimated monthly cost for 100 meetings:**
- OpenAI: $18
- Groq: $2 or free
- Hosting: $0-5
- **Total: ~$20-25/month**

## Support

If you encounter issues:

1. Check backend logs: `backend/` terminal
2. Check frontend console: Browser DevTools
3. Review MongoDB logs
4. Check Firebase Console for auth issues

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure MongoDB
3. ✅ Start backend server
4. ✅ Configure frontend
5. ✅ Test authentication
6. ✅ Test meeting upload
7. 📝 Deploy to production
8. 📝 Set up monitoring
9. 📝 Configure backups

Congratulations! You've successfully migrated from Supabase to Firebase + MongoDB! 🎉
