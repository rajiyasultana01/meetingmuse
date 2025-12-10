# MeetingMuse Render Deployment Guide

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Atlas** (Recommended): Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Firebase Project**: Ensure you have your Firebase credentials
4. **API Keys**: Have your OpenAI and Groq API keys ready

## Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Ensure your repository is public or connected to Render**

## Step 2: Set Up MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox tier)
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/meetingmuse?retryWrites=true&w=majority
   ```

## Step 3: Deploy to Render

### Option A: Using Blueprint (render.yaml) - RECOMMENDED

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will detect `render.yaml` automatically**
5. **Configure Environment Variables** (see Section 4 below)
6. **Click "Apply"** - Render will deploy both services

### Option B: Manual Deployment

#### Deploy Backend:
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `meetingmuse-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Deploy Frontend:
1. Click "New" → "Static Site"
2. Connect your repository
3. Configure:
   - **Name**: `meetingmuse-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

## Step 4: Configure Environment Variables

### Backend Environment Variables

Go to your backend service settings and add:

```env
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
OPENAI_API_KEY=<your-openai-api-key>
GROQ_API_KEY=<your-groq-api-key>
API_SECRET_KEY=<generate-a-random-secret>
CORS_ORIGIN=<your-frontend-url>
```

**Important Notes:**
- Replace `<your-frontend-url>` with your actual frontend URL (e.g., `https://meetingmuse-frontend.onrender.com`)
- For `FIREBASE_PRIVATE_KEY`, paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Generate a strong random string for `API_SECRET_KEY` (you can use: `openssl rand -base64 32`)

### Frontend Environment Variables

Go to your frontend static site settings and add:

```env
VITE_API_URL=<your-backend-url>
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
VITE_FIREBASE_APP_ID=<your-firebase-app-id>
```

**Important Notes:**
- Replace `<your-backend-url>` with your actual backend URL (e.g., `https://meetingmuse-backend.onrender.com`)

## Step 5: Update Firebase Configuration

1. Go to Firebase Console → Authentication → Settings
2. Add your Render frontend URL to **Authorized domains**:
   - `meetingmuse-frontend.onrender.com` (or your custom domain)

## Step 6: Post-Deployment Setup

### Create Admin User

After deployment, SSH into your backend service or run locally:

```bash
# Option 1: Use the setup-admin script
npm run setup-admin

# Option 2: Promote an existing user
npx tsx src/scripts/promote-user.ts <email@example.com>
```

### Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://meetingmuse-backend.onrender.com/health`
   - Should return: `{"status":"ok",...}`

2. **Check Frontend**:
   - Visit: `https://meetingmuse-frontend.onrender.com`
   - You should see the login page

3. **Test Login**:
   - Try logging in with your credentials
   - Admin users should be redirected to `/admin`

## Important Notes for Render Free Tier

1. **Cold Starts**: Free tier services spin down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   
2. **Disk Storage**: Uploaded videos are stored temporarily
   - Consider upgrading to a paid plan for persistent storage
   - Or integrate with cloud storage (S3, Firebase Storage)

3. **Build Minutes**: Free tier includes 500 build minutes/month
   - Optimize your `package.json` to avoid unnecessary rebuilds

4. **MongoDB Connection**: 
   - Use Atlas free tier (M0) for persistent data
   - Don't use Render's PostgreSQL unless you migrate to it

## Troubleshooting

### Build Fails

1. Check build logs in Render dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

### Backend Won't Start

1. Check environment variables are set correctly
2. Verify MongoDB connection string is valid
3. Check logs for specific errors

### Frontend Can't Connect to Backend

1. Verify `VITE_API_URL` is set correctly
2. Check CORS settings in backend
3. Ensure backend is deployed and healthy

### Video Upload/Playback Issues

1. Check FFmpeg is available (may need custom Docker image for Render)
2. Verify storage permissions
3. Consider using cloud storage for production

## Custom Domain (Optional)

1. Go to your frontend service settings
2. Add a custom domain
3. Update Firebase authorized domains
4. Update backend CORS_ORIGIN

## Monitoring

- Use Render's built-in logs and metrics
- Set up health checks: `/health` endpoint
- Monitor MongoDB Atlas performance

## Scaling

When ready to scale:
1. Upgrade Render plans for better performance
2. Enable auto-scaling
3. Use separate PostgreSQL database
4. Implement CDN for static assets
5. Add Redis for caching

---

**Need Help?**
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Firebase Docs: https://firebase.google.com/docs
