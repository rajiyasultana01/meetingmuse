# Troubleshooting "Processing in progress..."

It seems your meeting is stuck. This usually happens for one of two reasons:

## 1. It's an "Old" Meeting (Most Likely)
Any video you uploaded **BEFORE** I deployed the "FFmpeg Fix" (about 20 minutes ago) is permanently stuck.
- The server tried to process it, failed (because FFmpeg was missing), and left it in a zombie state.
- **Solution**: Delete this meeting. It will never finish.

## 2. Missing API Keys (If New Uploads Fail)
If you uploaded a **BRAND NEW** video just now and it is *still* stuck, you might be missing API Keys in Render.

**Check Render Dashboard → Environment:**
- **`OPENAI_API_KEY`**: Required for Transcription.
- **`GROQ_API_KEY`**: Required for Summarization.
  - If you don't have a Groq key, get one (it's free/cheap) or the summary step will fail.
  - *If this key is missing, the status should eventually go to "Failed", but it's good to check.*

## How to Test Correctly

1.  **Delete** the stuck meeting.
2.  **Refresh** the page to ensure you have the latest code.
3.  **Upload a NEW Video**.
4.  Watch the text under "Processing in progress...":
    - Phase 1: "Extracting transcript..." (FFmpeg + OpenAI)
    - Phase 2: "Generating AI summary..." (Groq)
    - Phase 3: "Completed!"

If it gets stuck specifically at "Extracting transcript...", it means FFmpeg or OpenAI is failing.
If it gets stuck at "Generating AI summary...", it means Groq is failing.

---
**Action Plan:**
1. Delete the old meeting.
2. Verify you have `OPENAI_API_KEY` and `GROQ_API_KEY` in Render.
3. Upload a new video.
