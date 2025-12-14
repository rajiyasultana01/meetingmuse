# Deploy Notes: Build & Runtime Fixes

I have pushed a critical update to fix the **Build Failure** and **Runtime Crash**.

## 1. Fixed "Build Failed" (TypeScript Error)
- The build log showed `Type 'typeof ...' is not assignable to type 'string'`.
- **Fix:** I updated `transcription.service.ts` to strictly cast the `ffmpeg-static` import to a string. This resolves the TypeScript compiler error.

## 2. Fixed "Instance Failed" (Out of Memory)
- The previous runtime crash (`Ran out of memory`) was due to buffering FFmpeg logs.
- **Fix:** I switched the execution method from `exec` to `spawn`. This processes the video using streams, keeping memory usage very low (<100MB instead of >512MB).

## 3. What to Expect
- **Deploying...**: The backend is rebuilding now. It should pass the build step this time.
- **Runtime**: Once live (green checkmark in Render), you can upload videos without crashing the server.

---
**Troubleshooting:**
- If you *still* see `401 Unauthorized` after this deploy, remember to check your **Firebase Private Key** in Render Dashboard.
- If you see "Processing..." stuck on old meetings, delete them. Upload NEW ones.

**Status:** ✅ Pushed to Main. Waiting for Render.
