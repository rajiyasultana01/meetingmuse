# Fixed: Stuck on "Transcribing"

## Problem

Meetings were getting stuck indefinitely in the **Transcribing** status.

**Root Cause:**
The backend relies on `FFmpeg` to extract audio from video for transcription.
On the Render server, **FFmpeg was not installed**, causing the process to fail silently or crash without updating the status to "Failed".

## Solution

I have installed `ffmpeg-static` in the backend project. This is a library that automatically downloads and provides the correct FFmpeg binary for the operating system (Linux on Render).

**Changes Made:**
1.  **`backend/package.json`**: Added `ffmpeg-static` dependency.
2.  **`backend/src/services/transcription.service.ts`**: Updated code to use the static FFmpeg binary path.

## Verification

**Wait 5-10 minutes for Backend Deployment.** (This takes longer than frontend because it installs new dependencies).

**How to Test:**
1.  **Important:** The meetings currently stuck in "Transcribing" are dead. You cannot fix them.
2.  **Delete** the stuck meeting (or ignore it).
3.  **Upload a NEW video.**
4.  It should now progress from `Uploaded` -> `Transcribing` -> `Summarizing` -> `Completed`.

**Note:**
If it *still* fails (goes to "Failed" status), check the **Logs** in Render Dashboard. The next common failure point is a missing `OPENAI_API_KEY`. ensure that is set in the Render Backend Environment Variables!

---
**Status**: ✅ Backend Fix Pushed
**Date**: December 11, 2025
**Files**: `backend/package.json`, `backend/src/services/transcription.service.ts`
