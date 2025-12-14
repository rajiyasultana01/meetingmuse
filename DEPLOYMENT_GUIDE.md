# MeetingMuse Deployment Guide

## 🏗️ Architecture
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express (Lightweight API)
- **Database**: MongoDB Atlas
- **Auth**: Firebase Authentication
- **AI Processing**: **Google Gemini 1.5 Flash** (Video -> Text + Summary)

## 🚀 Environment Variables (Render)

### Backend (`meetingmuse-backend`)
| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production` |
| `MONGODB_URI` | Connection string for MongoDB Atlas |
| `GEMINI_API_KEY` | **Required** for all transcription/summary. Get from Google AI Studio. |
| `FIREBASE_PROJECT_ID` | From Firebase Service Account |
| `FIREBASE_CLIENT_EMAIL` | From Firebase Service Account |
| `FIREBASE_PRIVATE_KEY` | Full private key (including `-----BEGIN...`) |
| `PORT` | `5000` (Default) |

### Frontend (`meetingmuse-frontend`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | https://meetingmuse-backend.onrender.com/api |
| `VITE_FIREBASE_Config`| (If handled via env, otherwise hardcoded in `src/config/firebase.ts`) |

## 🛠️ Key Features & Fixes
1.  **Lightweight Processing**: FFmpeg and OpenAI have been removed. The backend simply streams uploads to Gemini.
2.  **Video Playback**: The frontend automatically rewrites `localhost` URLs to production URLs if they were saved incorrectly.
3.  **SPA Routing**: Redirect rules are configured to support React Router on page refresh.

## 🛑 Troubleshooting

### 401 Unauthorized
If you cannot login or fetch meetings:
-   **Check `FIREBASE_PRIVATE_KEY`** in Render Backend. It must be exact.
-   Ensure Frontend is waiting for Auth (Fixed in `UserDashboard.tsx`).

### Processing Stuck?
-   Ensure `GEMINI_API_KEY` is set.
-   Delete old stuck meetings and upload new ones.
