# MeetingMuse Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:8080
- ✅ MongoDB connected
- ✅ Firebase configured

---

## 📝 Test Procedure

### **Step 1: Create an Account**

1. Open http://localhost:8080
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in the signup form:
   - **Email:** test@example.com
   - **Password:** Test123456
   - **Display Name:** Test User
4. Click **"Sign Up"**
5. You should be redirected to the dashboard

### **Step 2: Upload a Test Video**

1. Navigate to **"Summarize Meeting"** page
2. Click the **file input** to select a video
3. Choose a **small video file** (1-5 minutes recommended for first test)
   - Supported formats: MP4, MOV, AVI, WEBM
   - Max size: 5GB (but start small!)
4. Click **"Generate AI Summary"**
5. Wait for processing (2-5 minutes typically)

### **Step 3: View Results**

1. Once processing completes, you'll see:
   - ✅ Meeting summary
   - ✅ Key points
   - ✅ Action items
   - ✅ Topics discussed
   - ✅ Sentiment analysis

---

## 🐛 Troubleshooting

### **Issue: Browser Extension Logs (content.js)**

**Symptoms:**
```
content.js:1650 🔘 Click detected on platform: custom
content.js:1725 🔘 Click analysis complete - no save button found
```

**Solution:**
These logs are from a Chrome extension (likely LexEye) and are **harmless**. They don't break functionality.

**To remove the noise:**
1. **Option A:** Test in Incognito mode (Ctrl+Shift+N)
2. **Option B:** Disable extensions at chrome://extensions/
3. **Option C:** Ignore the logs - they don't affect functionality

---

### **Issue: "Upload not working"**

**Check:**
1. ✅ Are you logged in? (Check top-right corner for user menu)
2. ✅ Is the backend running? (Check http://localhost:5000/health)
3. ✅ Is the file a video? (Check file extension)
4. ✅ Is the file too large? (Max 5GB)
5. ✅ Check browser console (F12) for actual errors

---

### **Issue: Firebase Auth Error**

**Error:** "Firebase: Error (auth/...)"

**Solution:**
1. Check `frontend/.env` has all Firebase credentials
2. Verify Firebase Console → Authentication → Email/Password is enabled
3. Check browser console for specific error code

---

### **Issue: Backend Connection Error**

**Error:** "Network Error" or "Failed to fetch"

**Solution:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
3. Check browser console Network tab for failed requests
4. Verify CORS settings in backend

---

### **Issue: Processing Timeout**

**Error:** "Processing timeout. Please check your dashboard."

**Possible Causes:**
1. Video is too long (>30 minutes)
2. OpenAI API key is invalid or out of credits
3. Groq API key is invalid
4. MongoDB connection lost
5. FFmpeg not installed

**Solution:**
1. Check backend terminal for error logs
2. Verify API keys in `backend/.env`
3. Check MongoDB is running
4. Ensure FFmpeg is installed (required for audio extraction)

---

## 🔍 Debugging Tips

### **Check Backend Logs**
```bash
# In backend terminal, you should see:
🚀 Server running on port 5000
✅ MongoDB connected successfully
Starting transcription for: uploads/video.mp4
Generating summary with Groq...
```

### **Check Browser Console**
```
F12 → Console tab
Look for:
- Red errors (actual problems)
- Network tab → Failed requests (API errors)
- Ignore content.js logs (extension noise)
```

### **Check MongoDB**
```bash
# Connect to MongoDB
mongosh

# Check database
use meetingmind
db.users.find()
db.meetings.find()
```

### **Check Firebase**
1. Go to Firebase Console
2. Authentication → Users (should see your test user)
3. Storage → Files (should see uploaded videos after upload)

---

## 📊 Expected Processing Flow

```
1. User uploads video
   ↓
2. Frontend sends to backend API
   ↓
3. Backend saves to Firebase Storage
   ↓
4. Backend creates meeting record in MongoDB
   ↓
5. Backend extracts audio with FFmpeg
   ↓
6. Backend sends audio to OpenAI Whisper
   ↓
7. Backend receives transcript
   ↓
8. Backend cleans transcript
   ↓
9. Backend sends to Groq for summarization
   ↓
10. Backend saves summary to MongoDB
    ↓
11. Frontend polls and displays results
```

**Typical Timeline:**
- Upload: 5-30 seconds (depends on file size)
- Transcription: 1-3 minutes (depends on video length)
- Summarization: 10-30 seconds
- **Total: 2-5 minutes**

---

## ✅ Success Indicators

### **Backend Terminal:**
```
✅ MongoDB connected successfully
✅ Applied DNS Fix: Forced Google DNS
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS Origin: http://localhost:8080
```

### **Frontend Terminal:**
```
VITE v5.4.19  ready in 528 ms
➜  Local:   http://localhost:8080/
```

### **Browser:**
- No red errors in console (ignore content.js logs)
- Can sign up and log in
- Can select and upload files
- Processing status updates appear
- Summary displays after processing

---

## 🎯 Test Checklist

- [ ] Backend health check passes (http://localhost:5000/health)
- [ ] Frontend loads (http://localhost:8080)
- [ ] Can create account
- [ ] Can log in
- [ ] Can select video file
- [ ] Can click "Generate AI Summary"
- [ ] Processing starts (loading indicator appears)
- [ ] Backend logs show transcription progress
- [ ] Summary appears after processing
- [ ] Can copy summary
- [ ] Can upload another video

---

## 💡 Pro Tips

1. **Start Small:** Use a 1-2 minute video for first test
2. **Check Logs:** Keep backend terminal visible during upload
3. **Be Patient:** Processing takes 2-5 minutes
4. **Use Incognito:** Avoids extension interference
5. **Check Credits:** Ensure OpenAI API has credits

---

## 📞 Still Having Issues?

1. Check all environment variables are set correctly
2. Verify all services are running (backend, MongoDB, Firebase)
3. Check API keys are valid
4. Review backend terminal for specific error messages
5. Check browser console for network errors
6. Try a different video file

---

**Last Updated:** December 8, 2025
