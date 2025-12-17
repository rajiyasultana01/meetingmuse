# Deploying MeetingMuse to Railway 🚂

Railway is an excellent platform for deploying this monorepo project. Follow these steps to deploy both the Backend and Frontend.

## Prerequisites
1.  Push your latest code to GitHub.
2.  Create a [Railway account](https://railway.app/).
3.  Install the Railway CLI (optional, but UI is recommended).

---

## Part 1: Deploying the Backend

1.  **New Project**: Go to your Railway Dashboard and click **"New Project"** -> **"Deploy from GitHub repo"**.
2.  **Select Repo**: Choose your `meetingmuse` repository.
3.  **Configure Service**:
    *   Once the service appears, click on it to open settings.
    *   Go to **Settings** -> **Root Directory**: Set this to `/backend`.
    *   **Build Command**: `npm ci && npm run build` (Railway usually detects `npm run build`).
    *   **Start Command**: `npm start` (Railway usually detects this).
4.  **Environment Variables**:
    *   Go to the **Variables** tab.
    *   Add the following variables (copy values from your local `.env`):
        *   `NODE_ENV`: `production`
        *   `MONGODB_URI`: (Your MongoDB Atlas connection string)
        *   `FIREBASE_PROJECT_ID`: (From firebase-service-account.json)
        *   `FIREBASE_PRIVATE_KEY`: (From firebase-service-account.json - **Paste the entire key, including newlines**)
        *   `FIREBASE_CLIENT_EMAIL`: (From firebase-service-account.json)
        *   `GROQ_API_KEY`: (Your Groq API Key)
        *   `API_SECRET_KEY`: (A random secure string for your internal API security)
        *   `CORS_ORIGIN`: `https://<YOUR-FRONTEND-URL>.up.railway.app` (You will update this after deploying the frontend).
5.  **Networking**:
    *   Go to **Settings** and generate a **Public Domain** (e.g., `meetingmuse-backend-production.up.railway.app`).
    *   This is your **Backend URL**.

---

## Part 2: Deploying the Frontend

1.  **Add Service**: In the same Railway Project, click **"New"** -> **"GitHub Repo"** again.
2.  **Select Repo**: Choose the SAME `meetingmuse` repository again.
3.  **Configure Service**:
    *   Click on the new service.
    *   Go to **Settings** -> **Root Directory**: Set this to `/frontend`.
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start` (We added a `serve` command for this).
4.  **Environment Variables**:
    *   Go to the **Variables** tab.
    *   **CRITICAL**: Frontend variables must be available *during build time* for Vite.
    *   Add the following:
        *   `VITE_API_URL`: `https://<YOUR-BACKEND-URL>.up.railway.app/api` (Use the actual Backend URL from Part 1).
        *   `VITE_FIREBASE_API_KEY`: (From frontend .env)
        *   `VITE_FIREBASE_authDomain`: (From frontend .env)
        *   `VITE_FIREBASE_projectId`: (From frontend .env)
        *   `VITE_FIREBASE_storageBucket`: (From frontend .env)
        *   `VITE_FIREBASE_messagingSenderId`: (From frontend .env)
        *   `VITE_FIREBASE_appId`: (From frontend .env)
5.  **Networking**:
    *   Go to **Settings** and generate a **Public Domain**.
    *   This is your **Frontend URL**.

---

## Part 3: Final Integration

1.  **Update Backend CORS**:
    *   Go back to your **Backend Service** -> **Variables**.
    *   Update `CORS_ORIGIN` to match your **Frontend URL** (no trailing slash).
    *   Redeploy the Backend (it usually happens automatically on variable change).

2.  **Test**:
    *   Visit your Frontend URL.
    *   Try logging in (Google Auth should work if you added the Frontend domain to **Firebase Console -> Authentication -> Settings -> Authorized Domains**).
    *   Try uploading a meeting.

## Troubleshooting

*   **Build Fails?** Check the logs. Ensure dependencies are installed.
*   **White Screen on Frontend?** Check Browser Console (F12). If you see 404s, ensure `serve` is running correctly.
*   **Network Errors?** Ensure `VITE_API_URL` uses `https` and points to the correct backend domain.
