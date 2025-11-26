# MeetingMind Backend API

Backend server for MeetingMind with Firebase Authentication and MongoDB.

## Tech Stack

- **Node.js** + **Express** - Web server
- **TypeScript** - Type safety
- **Firebase Admin** - Authentication
- **MongoDB** + **Mongoose** - Database
- **OpenAI Whisper** - Transcription
- **Groq API** - AI Summarization
- **Firebase Storage** - Video storage

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable **Authentication** → Email/Password sign-in method
4. Go to **Project Settings** → **Service Accounts**
5. Click "Generate new private key"
6. Save the JSON file securely
7. Extract the following from the JSON:
   - `project_id`
   - `private_key`
   - `client_email`

### 3. Set Up MongoDB

Choose one option:

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Linux: sudo apt install mongodb

# Start MongoDB
mongod --dbpath ~/data/db
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Replace `<password>` with your password

### 4. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/meetingmind
# Or Atlas: mongodb+srv://username:password@cluster.mongodb.net/meetingmind

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# AI APIs
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...

# External API
API_SECRET_KEY=your-random-secret

# CORS
CORS_ORIGIN=http://localhost:8080
```

### 5. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 6. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Meetings

- `POST /api/meetings/upload` - Upload meeting video
- `GET /api/meetings` - Get all meetings (user)
- `GET /api/meetings/:id` - Get meeting details
- `DELETE /api/meetings/:id` - Delete meeting

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/meetings` - Get all meetings
- `GET /api/admin/analytics` - Get analytics
- `PUT /api/admin/users/:userId/role` - Update user role

### External API

- `POST /api/external/receive-recording` - Receive recording from external system

## Authentication

All protected endpoints require Firebase JWT token:

```http
Authorization: Bearer <firebase-id-token>
```

External API endpoints require API key:

```http
x-api-key: <your-api-secret>
```

## Database Models

### User
- firebaseUid (unique)
- email
- displayName
- photoURL
- role (user/admin)

### Meeting
- userId
- title
- description
- videoPath
- videoUrl
- status
- durationSeconds

### Transcript
- meetingId
- rawTranscript
- cleanedTranscript
- language
- wordCount

### Summary
- meetingId
- transcriptId
- summaryText
- keyPoints
- actionItems
- topics
- participants
- sentiment

### MeetingAnalytics
- meetingId
- viewCount
- shareCount
- downloadCount

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | Environment (development/production) |
| MONGODB_URI | Yes | MongoDB connection string |
| FIREBASE_PROJECT_ID | Yes | Firebase project ID |
| FIREBASE_PRIVATE_KEY | Yes | Firebase private key |
| FIREBASE_CLIENT_EMAIL | Yes | Firebase service account email |
| OPENAI_API_KEY | Yes | OpenAI API key for Whisper |
| GROQ_API_KEY | Yes | Groq API key for LLM |
| API_SECRET_KEY | Yes | Secret for external API |
| CORS_ORIGIN | No | Frontend URL (default: localhost:8080) |
| MAX_FILE_SIZE | No | Max upload size (default: 100MB) |
| UPLOAD_DIR | No | Upload directory (default: ./uploads) |

## Development

```bash
# Development with hot reload
npm run dev

# Type checking
tsc --noEmit

# Lint
npm run lint
```

## Deployment

### Railway / Render / Heroku

1. Set environment variables
2. Deploy repository
3. Build command: `npm run build`
4. Start command: `npm start`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### MongoDB Connection Error
- Check MONGODB_URI is correct
- Ensure MongoDB is running
- For Atlas: check IP whitelist

### Firebase Auth Error
- Verify Firebase credentials
- Check private key format (includes \n)
- Ensure service account has permissions

### Video Upload Fails
- Check MAX_FILE_SIZE
- Ensure uploads/ directory exists
- Verify Firebase Storage bucket exists

### Transcription Fails
- Check OpenAI API key
- Verify API credits
- Check video format is supported

## License

MIT
