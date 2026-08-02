# Authentication Troubleshooting & Testing Guide

## Quick Fix for Vercel CORS Error

### ❌ Problem
```
CORS error when logging in
Backend returns: {"detail":"Not Found"}
Network tab shows: 404 error on /auth/login
```

### ✅ Solution
**Set Vercel Environment Variable:**

1. Go to: https://vercel.com/dashboard
2. Select: smartcare-connect-ai project
3. Go to: Settings → Environment Variables
4. Add new variable:
   ```
   Name:    VITE_API_URL
   Value:   https://smartcare-connect-api.onrender.com/api/v1
   Environments: Production, Preview, Development (select all)
   ```
5. Click: Save
6. Go to: Deployments
7. Click: Redeploy (or push code to trigger auto-deploy)

### ✅ Alternative: Use vercel.json
**File**: `vercel.json` (in root) - Already created
```json
{
  "env": {
	"VITE_API_URL": "https://smartcare-connect-api.onrender.com/api/v1"
  }
}
```
This auto-configures Vercel without manual dashboard entry.

---

## Check Backend is Running

### Via Browser
1. Open: `https://smartcare-connect-api.onrender.com/health`
   - Should show: `{"status":"healthy"}`
2. Open: `https://smartcare-connect-api.onrender.com/`
   - Should show API info

### Via curl
```bash
# Health check
curl -X GET https://smartcare-connect-api.onrender.com/health

# API info
curl -X GET https://smartcare-connect-api.onrender.com/

# Test login (will fail with invalid credentials, but proves endpoint exists)
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","role":"patient"}'
```

---

## Test Login Locally (Development)

### Step 1: Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Step 2: Start Frontend
```bash
# In another terminal
npm run dev
```

### Step 3: Login Test
- Navigate to: http://localhost:5173/login
- Email: `demo@SmartCare-Connect.ai`
- Password: `demo1234`
- Expected: Success ✅

### Debugging
1. **Check DevTools Console** - Look for error messages
2. **Check Network Tab** - Verify request/response
3. **Check Storage** - Verify token saved in localStorage
4. **Backend Logs** - Check for error on uvicorn terminal

---

## Test All Auth Endpoints

### 1. Login Endpoint
```bash
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
	"email": "demo@SmartCare-Connect.ai",
	"password": "demo1234",
	"role": "patient"
  }'

# Response (success):
{
  "success": true,
  "data": {
	"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"token_type": "bearer",
	"role": "patient",
	"user_id": "...",
	"full_name": "Demo Patient",
	"email": "demo@SmartCare-Connect.ai",
	"profile_image": ""
  },
  "message": "Login successful"
}

# Response (failure):
{
  "detail": "Invalid email or password"  // or "Account is deactivated"
}
```

### 2. Register Endpoint
```bash
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
	"full_name": "John Doe",
	"email": "john@example.com",
	"phone": "+919876543210",
	"password": "SecurePass123",
	"role": "patient",
	"dob": "1990-01-15",
	"gender": "M",
	"blood_group": "O+",
	"address": "123 Main St"
  }'

# Response (success):
{
  "success": true,
  "data": {
	"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"token_type": "bearer",
	"role": "patient",
	"user_id": "..."
  },
  "message": "Registration successful"
}

# Response (failure):
{
  "detail": "Email already registered"  // or "Phone number already registered"
}
```

### 3. Send OTP Endpoint
```bash
# For email
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
	"email": "user@example.com"
  }'

# For phone
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
	"phone": "+919876543210"
  }'

# Response (success):
{
  "success": true,
  "data": {
	"identifier": "user@example.com",
	"identifier_type": "email",
	"expires_at": "2024-01-15T10:30:45.123456+00:00"
  },
  "message": "OTP sent successfully"
}

# Note: In development, OTP prints to console
```

### 4. Verify OTP Endpoint
```bash
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
	"email": "user@example.com",
	"otp": "123456"
  }'

# Response (success):
{
  "success": true,
  "message": "OTP verified successfully"
}

# Response (failure):
{
  "detail": "Invalid OTP"  // or "OTP expired"
}
```

### 5. Get Current User Endpoint
```bash
# Replace TOKEN with actual access token from login
curl -X GET https://smartcare-connect-api.onrender.com/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"

# Response (success):
{
  "success": true,
  "data": {
	"id": "ObjectId",
	"full_name": "Demo Patient",
	"email": "demo@SmartCare-Connect.ai",
	"phone": "+919876543210",
	"role": "patient",
	"is_verified": true,
	"is_active": true,
	"created_at": "2024-01-01T00:00:00",
	"updated_at": "2024-01-15T10:00:00"
  },
  "message": "User profile retrieved"
}

# Response (no token / invalid token):
{
  "detail": "Not authenticated"
}
```

### 6. Refresh Token Endpoint
```bash
curl -X POST https://smartcare-connect-api.onrender.com/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
	"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }'

# Response (success):
{
  "success": true,
  "data": {
	"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"token_type": "bearer"
  },
  "message": "Token refreshed"
}

# Response (invalid token):
{
  "detail": "Invalid refresh token"
}
```

---

## Verify CORS Configuration

### Check CORS Headers
```bash
# Send preflight request
curl -X OPTIONS https://smartcare-connect-api.onrender.com/api/v1/auth/login \
  -H "Origin: https://smartcare-connect-ai.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Look for response headers:
# Access-Control-Allow-Origin: https://smartcare-connect-ai.vercel.app
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: *
# Access-Control-Allow-Headers: *
```

### Expected CORS Headers
```
Access-Control-Allow-Origin: https://smartcare-connect-ai.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, DELETE, HEAD, PUT, POST, PATCH, OPTIONS
Access-Control-Allow-Headers: content-type, authorization
```

---

## Frontend API Configuration (Already Correct)

### File: `src/services/api.js`
```javascript
// Line 5: API_BASE uses environment variable first, then fallback
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api/v1' : 'https://smartcare-connect-api.onrender.com/api/v1');

// Line 7-12: Axios instance with proper headers
const api = axios.create({
  baseURL: API_BASE,
  headers: {
	'Content-Type': 'application/json',
  },
});

// Line 14-20: Adds Bearer token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('SmartCare-Connect_token');
  if (token) {
	config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));
```

### File: `src/context/AuthContext.jsx`
```javascript
// Line 40-57: Login implemented correctly
const login = async (email, password) => {
  const res = await authApi.login({ email, password, role: selectedRole });
  if (res?.data?.access_token) {
	localStorage.setItem('SmartCare-Connect_token', res.data.access_token);
	const profile = await authApi.getMe().then((r) => r.data).catch(() => null);
	const authenticatedUser = profile || { ... };
	setUser(authenticatedUser);
	return authenticatedUser;
  }
  throw new Error('Login failed');
};
```

---

## Common Issues & Solutions

### Issue 1: CORS Error in Browser Console
```
Access to XMLHttpRequest at 'https://smartcare-connect-api.onrender.com/api/v1/auth/login' 
from origin 'https://smartcare-connect-ai.vercel.app' has been blocked by CORS policy
```
**Solution**: 
- Verify Vercel `VITE_API_URL` environment variable is set
- Check backend CORS_ORIGINS includes Vercel URL
- Redeploy both frontend and backend

### Issue 2: 404 "Not Found" Response
```
Status: 404
Response: {"detail":"Not Found"}
```
**Solution**:
- Verify API_BASE URL is correct
- Check endpoint path (should be `/api/v1/auth/login`, not `/auth/login`)
- Verify backend is running and deployed

### Issue 3: 401 "Invalid Credentials"
```
Status: 401
Response: {"detail":"Invalid email or password"}
```
**Solution**:
- Check email/password are correct
- Verify demo user exists in database
- Check user account is active (is_active: true)

### Issue 4: Token Not Persisting
```
localStorage shows no 'SmartCare-Connect_token' after login
```
**Solution**:
- Check browser localStorage is enabled
- Verify login API response includes `access_token`
- Check browser console for JavaScript errors

### Issue 5: Subsequent Requests Have No Token
```
API calls fail with 401, even though login was successful
```
**Solution**:
- Verify token is in localStorage
- Check Authorization header is being added (Network tab)
- Verify token format is 'Bearer {token}'

---

## Environment Variables Summary

### Frontend (Vercel)
```
VITE_API_URL=https://smartcare-connect-api.onrender.com/api/v1
VITE_BASE_URL=/
VITE_INTRO_VIDEO_URL=https://your-cdn.com/intro.mp4
```

### Backend (Render)
```
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://smartcare-connect-ai.vercel.app,http://localhost:5173
SMTP_HOST=smtp.gmail.com (for email OTP)
SMTP_USERNAME=...
SMTP_PASSWORD=...
EMAIL_FROM=noreply@smartcareconnect.com
```

---

## Demo Credentials (in Development)
```
Email:    demo@SmartCare-Connect.ai
Password: demo1234
Role:     patient
```

This account is created automatically on first backend startup (see `backend/app/utils/demo.py`).

---

## Support Checklist

- [ ] Backend running on Render (check `/health`)
- [ ] Frontend deployed on Vercel
- [ ] Vercel has `VITE_API_URL` environment variable set
- [ ] Backend CORS includes frontend URL
- [ ] Demo user exists in MongoDB
- [ ] JWT_SECRET is configured in backend
- [ ] Local testing works (dev mode)
- [ ] Login returns access_token
- [ ] Token persists in localStorage
- [ ] Authenticated requests include Authorization header
- [ ] CORS preflight passes (check Network tab)
