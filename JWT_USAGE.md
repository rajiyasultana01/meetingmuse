# JWT Authentication Usage Guide

This guide explains how JWT authentication is implemented in MeetingMind.

## Overview

MeetingMind uses **JWT (JSON Web Tokens)** for authentication. Supabase Auth provides JWT tokens that are:
- Stored in `localStorage` for persistence
- Automatically refreshed when expired
- Used for authenticating API requests

## How It Works

### 1. Login/Signup Process

When a user logs in or signs up:
1. Supabase returns a JWT `access_token` and `refresh_token`
2. Tokens are stored in `localStorage`:
   - `access_token` - Short-lived token for API requests (default 1 hour)
   - `refresh_token` - Long-lived token for getting new access tokens (default 30 days)

```typescript
// Login example
const { data } = await supabase.auth.signInWithPassword({ email, password });

// Tokens are stored automatically
localStorage.setItem('access_token', data.session.access_token);
localStorage.setItem('refresh_token', data.session.refresh_token);
```

### 2. Token Storage

**Location**: Browser `localStorage`

**Keys:**
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token

**View tokens in browser:**
1. Open DevTools (F12)
2. Go to Application → Local Storage → `http://localhost:8081`
3. See `access_token` and `refresh_token`

### 3. Making Authenticated API Requests

Use the JWT token in the `Authorization` header:

```typescript
import { getAuthHeaders, fetchWithAuth } from '@/lib/jwt';

// Option 1: Using the utility function
const response = await fetchWithAuth('https://api.example.com/meetings', {
  method: 'GET',
});

// Option 2: Manual header
const token = localStorage.getItem('access_token');
const response = await fetch('https://api.example.com/meetings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Option 3: Using Supabase (automatic)
const { data } = await supabase.from('meetings').select('*');
// Supabase automatically includes the JWT token
```

## JWT Utility Functions

Located in `src/lib/jwt.ts`:

### Get Tokens
```typescript
import { getAccessToken, getRefreshToken } from '@/lib/jwt';

const accessToken = getAccessToken();
const refreshToken = getRefreshToken();
```

### Check Authentication
```typescript
import { isAuthenticated } from '@/lib/jwt';

if (isAuthenticated()) {
  // User is logged in with valid token
} else {
  // Token expired or not logged in
  navigate('/login');
}
```

### Decode Token
```typescript
import { decodeToken, getUserIdFromToken } from '@/lib/jwt';

const token = getAccessToken();
const payload = decodeToken(token);

console.log('User ID:', payload.sub);
console.log('Email:', payload.email);
console.log('Expires:', new Date(payload.exp * 1000));

// Or get user ID directly
const userId = getUserIdFromToken();
```

### Check Token Expiration
```typescript
import { getTokenExpiration, isTokenExpiringSoon } from '@/lib/jwt';

const expiration = getTokenExpiration();
console.log('Token expires at:', expiration);

if (isTokenExpiringSoon()) {
  // Token expires in less than 5 minutes
  // Refresh it proactively
}
```

### Make Authenticated Requests
```typescript
import { fetchWithAuth, getAuthHeaders } from '@/lib/jwt';

// Using fetchWithAuth helper
const response = await fetchWithAuth('/api/meetings', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Meeting' }),
});

// Or get headers manually
const headers = getAuthHeaders();
// Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }
```

## JWT Token Structure

A JWT token has three parts separated by dots:

```
eyJhbGci...header.eyJzdWI...payload.SflKxw...signature
```

**Header** (Algorithm & Token Type):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (User Data):
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Signature**: Used to verify the token hasn't been tampered with

## Token Lifecycle

1. **Login** → Receive tokens → Store in localStorage
2. **Make Requests** → Include `Authorization: Bearer <token>` header
3. **Token Expires** → Supabase automatically refreshes using `refresh_token`
4. **Logout** → Clear tokens from localStorage

## Security Best Practices

✅ **DO:**
- Store tokens in `localStorage` (already implemented)
- Always use HTTPS in production
- Include tokens in `Authorization` header
- Clear tokens on logout
- Check token expiration before requests

❌ **DON'T:**
- Store tokens in cookies (vulnerable to CSRF)
- Expose tokens in URLs
- Share tokens between users
- Store sensitive data in JWT payload (it's readable!)

## Example: Protected API Route

### Frontend Request
```typescript
import { fetchWithAuth } from '@/lib/jwt';

const uploadMeeting = async (videoFile: File) => {
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await fetchWithAuth(
    'https://your-api.com/api/meetings/upload',
    {
      method: 'POST',
      body: formData,
      headers: {
        // Authorization header added automatically
        // Don't set Content-Type for FormData
      },
    }
  );

  return response.json();
};
```

### Backend Verification (Node.js Example)
```javascript
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route
app.post('/api/meetings/upload', verifyToken, (req, res) => {
  const userId = req.user.sub;
  // Process upload for authenticated user
});
```

## Debugging JWT Issues

### View Token in Console
```typescript
const token = localStorage.getItem('access_token');
console.log('Full token:', token);

// Decode and view payload
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token payload:', payload);
console.log('Expires at:', new Date(payload.exp * 1000));
```

### Common Issues

**401 Unauthorized:**
- Token expired → Login again
- Token missing → Check localStorage
- Invalid token → Clear storage and login

**403 Forbidden:**
- User doesn't have permission
- Check user role in token payload

**Token Not Persisting:**
- Check browser console for errors
- Verify localStorage is not disabled
- Check for private/incognito mode

## Integration with Supabase Edge Functions

When calling Supabase Edge Functions, include the JWT token:

```typescript
const { data, error } = await supabase.functions.invoke(
  'process-meeting-video',
  {
    body: { video: base64Data },
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  }
);
```

Supabase automatically validates the token and provides the user context.

## Token Refresh

Supabase automatically handles token refresh:
- When `access_token` expires, Supabase uses `refresh_token` to get a new one
- This happens automatically in the background
- You can manually trigger refresh:

```typescript
const { data, error } = await supabase.auth.refreshSession();

if (data.session) {
  localStorage.setItem('access_token', data.session.access_token);
  localStorage.setItem('refresh_token', data.session.refresh_token);
}
```

## Summary

- ✅ JWT tokens are automatically managed by Supabase
- ✅ Tokens stored in localStorage for persistence
- ✅ Use `Authorization: Bearer <token>` header for API requests
- ✅ Tokens auto-refresh when expired
- ✅ Utility functions provided in `src/lib/jwt.ts`
- ✅ Check browser console logs to see token operations

**Your authentication is now fully JWT-based!**
