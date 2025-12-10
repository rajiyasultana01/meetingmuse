# 🚀 MeetingMuse Render Deployment Checklist

## Pre-Deployment Preparation

- [ ] Sign up for Render account at https://render.com
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Set up free MongoDB cluster (M0 tier)
- [ ] Create database user and get connection string
- [ ] Have Firebase credentials ready
- [ ] Have OpenAI API key
- [ ] Have Groq API key

## Repository Setup

- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Add Render deployment configuration"
  git push origin main
  ```
- [ ] Ensure repository is public or connected to Render

## Render Deployment

### Using Blueprint (Recommended)

- [ ] Go to Render Dashboard
- [ ] Click "New" → "Blueprint"
- [ ] Connect GitHub repository
- [ ] Render detects `render.yaml`
- [ ] Review services to be created (backend + frontend)
- [ ] Click "Apply"

### Configure Backend Environment Variables

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = `<your-atlas-connection-string>`
- [ ] `FIREBASE_PROJECT_ID` = `<from Firebase Console>`
- [ ] `FIREBASE_PRIVATE_KEY` = `<from Firebase service account>`
- [ ] `FIREBASE_CLIENT_EMAIL` = `<from Firebase service account>`
- [ ] `OPENAI_API_KEY` = `<your OpenAI key>`
- [ ] `GROQ_API_KEY` = `<your Groq key>`
- [ ] `API_SECRET_KEY` = `<generate with: openssl rand -base64 32>`
- [ ] `CORS_ORIGIN` = `https://meetingmuse-frontend.onrender.com`

### Configure Frontend Environment Variables

- [ ] `VITE_API_URL` = `https://meetingmuse-backend.onrender.com`
- [ ] `VITE_FIREBASE_API_KEY` = `<from Firebase Console>`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `<project-id>.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `<from Firebase Console>`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `<project-id>.firebasestorage.app`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `<from Firebase Console>`
- [ ] `VITE_FIREBASE_APP_ID` = `<from Firebase Console>`

## Firebase Configuration

- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Add authorized domain: `meetingmuse-frontend.onrender.com`
- [ ] Add authorized domain for backend: `meetingmuse-backend.onrender.com`

## Post-Deployment

- [ ] Wait for both services to deploy (usually 3-5 minutes)
- [ ] Check backend health: `https://meetingmuse-backend.onrender.com/health`
- [ ] Visit frontend: `https://meetingmuse-frontend.onrender.com`
- [ ] Create admin user (see below)
- [ ] Test login functionality
- [ ] Test meeting creation/upload
- [ ] Test video playback

## Create Admin User

Option 1: Run setup script locally
```bash
cd backend
npm run setup-admin
```

Option 2: Promote existing user locally
```bash
cd backend
npx tsx src/scripts/promote-user.ts your-email@example.com
```

## Verification Tests

- [ ] Backend responds to `/health` endpoint
- [ ] Frontend loads without errors
- [ ] Can sign up new user
- [ ] Can log in with credentials
- [ ] Can log in with Google
- [ ] Admin user redirects to `/admin`
- [ ] Can upload a meeting recording
- [ ] Can view meeting details
- [ ] Can play video recordings

## Troubleshooting

### If Backend Won't Start
1. Check environment variables are set
2. Verify MongoDB connection string
3. Check Render logs for errors
4. Ensure Firebase credentials are correct

### If Frontend Can't Connect
1. Verify `VITE_API_URL` matches backend URL
2. Check CORS settings in backend
3. Ensure backend is deployed and healthy

### If Video Upload Fails
1. Check file size limits (Render free tier has restrictions)
2. Verify FFmpeg availability
3. Consider cloud storage (S3/Firebase Storage) for production

## Notes

- **Free Tier Limitations**: Services spin down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds after cold start
- **MongoDB**: Use Atlas free tier for persistence
- **Storage**: Uploaded files may not persist on free tier

## Support Resources

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Firebase Console: https://console.firebase.google.com
- MeetingMuse Deployment Guide: See `RENDER_DEPLOYMENT.md`

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
