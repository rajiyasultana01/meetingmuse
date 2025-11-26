# MeetingMind Quick Start Guide

## ✅ What's Been Set Up

### Frontend
- ✅ Firebase configuration added to `.env`
- ✅ Firebase Auth integration
- ✅ Axios API client configured
- ✅ AuthProvider added to app
- ✅ Login/Signup pages updated
- ✅ Header component updated
- ✅ **Running on http://localhost:8081**

### Backend (Not Started Yet)
- ⏳ Needs MongoDB connection
- ⏳ Needs Firebase Admin SDK credentials
- ⏳ Needs API keys (OpenAI, Groq)

## 🚀 Next Steps to Complete Setup

### Step 1: Set Up MongoDB

Choose one option:

**Option A: Local MongoDB (Quick)**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows - Download from mongodb.com and install

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/meetingmind`

### Step 2: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **meetingmuse-541a0**
3. Click⚙️ → **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. You'll need these values from the JSON:
   - `project_id`
   - `private_key`
   - `client_email`

### Step 3: Get AI API Keys

**OpenAI (Whisper API):**
1. Go to https://platform.openai.com
2. Create account / Sign in
3. Go to API Keys
4. Create new key
5. Cost: ~$0.18 per 30min meeting

**Groq (LLaMA API):**
1. Go to https://console.groq.com
2. Create account / Sign in
3. Create API key
4. **Free tier available!**

### Step 4: Configure Backend

Create `backend/.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/meetingmind
# Or Atlas: mongodb+srv://username:password@cluster.mongodb.net/meetingmind

# Firebase Admin SDK (from the JSON file you downloaded)
FIREBASE_PROJECT_ID=meetingmuse-541a0
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@meetingmuse-541a0.iam.gserviceaccount.com

# AI APIs
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...

# External API Secret (generate with: openssl rand -base64 32)
API_SECRET_KEY=your-random-secret-key

# CORS
CORS_ORIGIN=http://localhost:8081

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
```

### Step 5: Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start on **http://localhost:5000**

### Step 6: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **meetingmuse-541a0**
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password**
5. Save

### Step 7: Enable Firebase Storage

1. In Firebase Console → **Storage**
2. Click **"Get started"**
3. Start in **production mode**
4. Choose location (e.g., us-central1)
5. Click **"Done"**

## 🎉 Ready to Test!

Once backend is running:

1. Open http://localhost:8081
2. Click **"Sign Up"**
3. Create account with email/password
4. Log in
5. Upload a short test video
6. Watch the AI process it!

## 📁 Current Status

```
✅ Frontend configured and running (port 8081)
✅ Firebase Auth enabled
✅ Firebase Storage bucket created
⏳ Backend needs configuration
⏳ MongoDB needs setup
⏳ API keys needed
```

## 🔧 Your Firebase Project Info

- **Project ID**: meetingmuse-541a0
- **Auth Domain**: meetingmuse-541a0.firebaseapp.com
- **Storage Bucket**: meetingmuse-541a0.firebasestorage.app

## 📚 Documentation

- **MIGRATION_GUIDE.md** - Complete detailed setup
- **backend/README.md** - Backend API documentation
- **NEW_README.md** - Full project documentation

## ❓ Troubleshooting

**Frontend won't load:**
- Check it's running: http://localhost:8081
- Check browser console for errors

**Can't sign up:**
- Ensure Firebase Email/Password is enabled
- Check browser console

**Backend won't start:**
- Check MongoDB is running
- Verify `.env` file exists in `backend/`
- Check all environment variables are set

**Video upload fails:**
- Backend must be running
- Check MongoDB connection
- Verify API keys are correct

## 🎯 Testing Checklist

- [ ] Frontend loads at http://localhost:8081
- [ ] Can create account (Sign Up)
- [ ] Can log in
- [ ] Backend running at http://localhost:5000
- [ ] MongoDB connected
- [ ] Upload test video (small file recommended)
- [ ] See transcription progress
- [ ] View AI-generated summary

## 💡 Pro Tips

1. **Use MongoDB Atlas** - Free tier, no local installation needed
2. **Small test videos** - Start with 1-2 minute videos
3. **Groq is free** - No credit card needed for testing
4. **Check logs** - Backend terminal shows processing progress

## Need Help?

1. Check backend logs in terminal
2. Check browser console (F12)
3. Review MIGRATION_GUIDE.md
4. Check Firebase Console for auth/storage issues

---

**Your system is ready for the final configuration steps!** 🚀
