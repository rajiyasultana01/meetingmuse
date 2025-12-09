# FFmpeg Installation Guide for Windows

## ❌ Current Issue

Your MeetingMuse backend is failing to process videos because FFmpeg is not installed:

```
Error: 'ffmpeg' is not recognized as an internal or external command
```

FFmpeg is required to extract audio from video files before sending to OpenAI Whisper for transcription.

---

## ✅ Solution: Install FFmpeg

### **Method 1: Download Pre-built Binary (Recommended - Fastest)**

1. **Download FFmpeg:**
   - Go to: https://www.gyan.dev/ffmpeg/builds/
   - Download: **ffmpeg-release-essentials.zip** (latest version)
   - Or direct link: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

2. **Extract the ZIP file:**
   - Extract to: `C:\ffmpeg\`
   - You should have: `C:\ffmpeg\bin\ffmpeg.exe`

3. **Add to System PATH:**
   
   **Option A: Using PowerShell (Run as Administrator):**
   ```powershell
   # Add FFmpeg to PATH
   $env:Path += ";C:\ffmpeg\bin"
   
   # Make it permanent
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\bin", [EnvironmentVariableTarget]::Machine)
   ```

   **Option B: Using GUI:**
   - Press `Win + X` → Select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\ffmpeg\bin`
   - Click "OK" on all dialogs

4. **Verify Installation:**
   ```powershell
   # Close and reopen PowerShell, then run:
   ffmpeg -version
   ```

   You should see FFmpeg version information.

5. **Restart Backend:**
   ```powershell
   # Stop the current backend (Ctrl+C)
   # Then restart:
   cd C:\Users\USER\Documents\Meowject\meetingmuse\backend
   npm run dev
   ```

---

### **Method 2: Using Chocolatey (If Admin Access Available)**

```powershell
# Run PowerShell as Administrator
choco install ffmpeg -y

# Verify
ffmpeg -version

# Restart backend
cd C:\Users\USER\Documents\Meowject\meetingmuse\backend
npm run dev
```

---

### **Method 3: Using Scoop (Alternative Package Manager)**

```powershell
# Install Scoop (if not installed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install FFmpeg
scoop install ffmpeg

# Verify
ffmpeg -version

# Restart backend
cd C:\Users\USER\Documents\Meowject\meetingmuse\backend
npm run dev
```

---

## 🔍 Verification Steps

After installation, verify FFmpeg is working:

### **1. Check FFmpeg Version:**
```powershell
ffmpeg -version
```

Expected output:
```
ffmpeg version 8.0.1-essentials_build-www.gyan.dev Copyright (c) 2000-2024 the FFmpeg developers
...
```

### **2. Test Audio Extraction:**
```powershell
cd C:\Users\USER\Documents\Meowject\meetingmuse\backend\uploads

# Test with your uploaded video
ffmpeg -i meeting-1765187012279-918969013.webm -vn -ar 16000 -ac 1 -b:a 32k test-audio.mp3 -y
```

If this works, you should see a `test-audio.mp3` file created.

### **3. Restart Backend and Test Upload:**
1. Stop backend (Ctrl+C in backend terminal)
2. Restart: `npm run dev`
3. Go to http://localhost:8080
4. Upload a test video
5. Watch backend logs - should now show:
   ```
   Starting transcription for: uploads\video.webm
   Extracting audio from video...
   Audio extracted: uploads\video.mp3 (X.XX MB)
   ```

---

## 🎯 Quick Start (Recommended Path)

**For fastest setup, use Method 1:**

1. Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
2. Extract to `C:\ffmpeg\`
3. Run in PowerShell (as Administrator):
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\bin", [EnvironmentVariableTarget]::Machine)
   ```
4. Close and reopen PowerShell
5. Verify: `ffmpeg -version`
6. Restart backend: `npm run dev`
7. Test upload again

---

## 🐛 Troubleshooting

### **Issue: "ffmpeg is not recognized" after installation**

**Solution:**
- Close ALL PowerShell/Terminal windows
- Reopen PowerShell
- Try: `ffmpeg -version`
- If still not working, restart your computer

### **Issue: "Access denied" when adding to PATH**

**Solution:**
- Run PowerShell as Administrator
- Or use GUI method (doesn't require admin)

### **Issue: Chocolatey lock file error**

**Solution:**
- Delete lock file:
  ```powershell
  Remove-Item "C:\ProgramData\chocolatey\lib\c00565a56f0e64a50f2ea5badcb97694d43e0755" -Force
  ```
- Try installation again
- Or use Method 1 (manual download) instead

### **Issue: Backend still can't find ffmpeg**

**Solution:**
1. Verify PATH is set correctly:
   ```powershell
   $env:Path -split ';' | Select-String ffmpeg
   ```
2. Check ffmpeg.exe exists:
   ```powershell
   Test-Path "C:\ffmpeg\bin\ffmpeg.exe"
   ```
3. Restart backend server
4. If still failing, try absolute path in code (temporary fix)

---

## 📊 What FFmpeg Does in MeetingMuse

```
Video Upload (WEBM/MP4/MOV)
         ↓
    FFmpeg extracts audio
         ↓
    Converts to MP3 (16kHz, mono, 32kbps)
         ↓
    Compressed audio sent to OpenAI Whisper
         ↓
    Transcription returned
         ↓
    Sent to Groq for summarization
```

**Why FFmpeg is needed:**
- OpenAI Whisper has a 25MB file size limit
- Videos are often 100MB+
- FFmpeg extracts and compresses just the audio
- Reduces file size by 90%+ while preserving speech quality

---

## ✅ Success Indicators

After successful installation, your backend logs should show:

```
✅ Applied DNS Fix: Forced Google DNS
✅ MongoDB connected successfully
🚀 Server running on port 5000
POST /api/meetings/upload 201 5362.079 ms - 236
Starting transcription for: uploads\meeting-xxx.webm
Extracting audio from video...
Audio extracted: uploads\meeting-xxx.mp3 (2.45 MB)  ← This line means FFmpeg worked!
```

---

## 🎉 Next Steps After Installation

1. ✅ Install FFmpeg (using one of the methods above)
2. ✅ Verify with `ffmpeg -version`
3. ✅ Restart backend server
4. ✅ Upload a test video
5. ✅ Watch it process successfully
6. ✅ View AI-generated summary

---

**Last Updated:** December 8, 2025
**FFmpeg Version:** 8.0.1 (latest stable)
