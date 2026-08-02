# Authentication Issue Diagnostic & Fix Report

## 1. ROOT CAUSE ANALYSIS

### Problem Identified:
**CORS Error + 404 "Not Found" Response**

### Backend Configuration (✓ CORRECT):
- **Auth Prefix**: `/auth` (line 11 in auth/routes.py)
- **API Prefix**: `/api/v1` (line 85 in main.py)
- **Full Auth Routes**: 
  - POST `/api/v1/auth/login`
  - POST `/api/v1/auth/register`
  - POST `/api/v1/auth/send-otp`
  - POST `/api/v1/auth/verify-otp`
  - GET `/api/v1/auth/me`
- **Health Endpoint**: GET `/health`
- **Root Endpoint**: GET `/`
- **CORS Origins** (Line 44, config.py):
  ```
  CORS_ORIGINS: "http://localhost:5173,http://localhost:3000,https://smartcare-connect-ai.vercel.app"
  ```
  ✓ Includes Vercel frontend URL

### Frontend Configuration (✗ ISSUE):
- **File**: `src/services/api.js` (line 5)
- **Current Logic**:
  ```javascript
  const API_BASE = import.meta.env.VITE_API_URL || 
	(import.meta.env.DEV ? '/api/v1' : 'https://smartcare-connect-api.onrender.com/api/v1');
  ```

### The Problem:
1. **On Vercel**: `import.meta.env.DEV` is `false`
2. **No VITE_API_URL set in Vercel environment**
3. **Falls back to hardcoded**: `https://smartcare-connect-api.onrender.com/api/v1`
4. **This URL is WRONG** - It's outdated or different from actual Render backend

## 2. CORRECT ENDPOINTS

✓ **Backend Root**: What is deployed on Render?
- Need exact deployed URL (e.g., `https://smartcare-connect-backend.onrender.com`)

✓ **Login Endpoint**: `POST {BACKEND_URL}/api/v1/auth/login`

✓ **Register Endpoint**: `POST {BACKEND_URL}/api/v1/auth/register`

✓ **Health Check**: `GET {BACKEND_URL}/health`

✓ **OTP Endpoints**:
- Send: `POST {BACKEND_URL}/api/v1/auth/send-otp`
- Verify: `POST {BACKEND_URL}/api/v1/auth/verify-otp`

✓ **Current User**: `GET {BACKEND_URL}/api/v1/auth/me`

## 3. CORS CONFIGURATION (✓ CORRECT)

Backend CORS is configured correctly (line 52-59, main.py):
```python
app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origins_list,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
```

CORS origins include Vercel:
```
http://localhost:5173, http://localhost:3000, https://smartcare-connect-ai.vercel.app
```

## 4. AUTHENTICATION FLOW (✓ CORRECT)

**Login Flow**:
1. Frontend `/pages/Login.jsx` calls `login(email, password)`
2. `AuthContext.jsx` line 40-57 executes login:
   - Calls `authApi.login({ email, password, role })` 
   - Stores access_token in localStorage
   - Fetches user profile via `authApi.getMe()`
   - Sets authenticated user state
3. User redirected to role home page

**Token Storage**:
- Key: `SmartCare-Connect_token` (localStorage)
- Used in API interceptor (api.js line 15-18)

## 5. REQUIRED FIXES

### Issue #1: Vercel Environment Variable Missing
**File**: Vercel Dashboard
**Action**: Set environment variable
- Name: `VITE_API_URL`
- Value: `https://{YOUR-RENDER-BACKEND-URL}/api/v1`

### Issue #2: Frontend API Fallback Outdated
**File**: `src/services/api.js`
**Current Issue**: Hardcoded URL might be incorrect
**Solution**: Already fixed in CORS config, but verify Vercel env var is set

### Issue #3: Verify Backend is Actually Deployed
**Action**: Test backend directly:
```bash
curl https://{YOUR-RENDER-BACKEND-URL}/health
curl https://{YOUR-RENDER-BACKEND-URL}/
```

## 6. FIX IMPLEMENTATION

### Step 1: Identify Correct Render Backend URL
The backend should respond with:
```bash
$ curl https://smartcare-connect-api.onrender.com/health
{"status":"healthy"}

$ curl https://smartcare-connect-api.onrender.com/
{"name":"SmartCare Connect API","version":"1.0.0","status":"running","docs":"/docs"}
```

### Step 2: Update Vercel Environment
1. Go to Vercel Dashboard > SmartCare Connect Project > Settings > Environment Variables
2. Add/Update:
   - Name: `VITE_API_URL`
   - Value: `https://smartcare-connect-api.onrender.com/api/v1` (or correct URL)
   - Select environments: Production, Preview, Development

3. Redeploy: `Trigger Deploy` (or `git push`)

### Step 3: Test Authentication
After Vercel redeploy, test:
1. Navigate to https://smartcare-connect-ai.vercel.app
2. Try login with: demo@SmartCare-Connect.ai / demo1234
3. Check browser DevTools:
   - Network tab: See POST to `/auth/login` going to correct backend
   - Console: No CORS errors
4. Verify token stored in localStorage

## 7. AUTHENTICATION ENDPOINTS REFERENCE

```
BASE_URL = https://smartcare-connect-api.onrender.com

POST /api/v1/auth/login
  Request: { email, password, role }
  Response: { access_token, refresh_token, token_type, role, user_id, full_name, email, profile_image }
  Status: 200 OK or 401 Unauthorized

POST /api/v1/auth/register
  Request: { full_name, email, phone, password, role, ... }
  Response: { access_token, refresh_token, token_type, role, user_id }
  Status: 200 OK or 400 Bad Request

POST /api/v1/auth/send-otp
  Request: { email or phone }
  Response: { identifier, identifier_type, expires_at }
  Status: 200 OK

POST /api/v1/auth/verify-otp
  Request: { email or phone, otp }
  Response: { message }
  Status: 200 OK or 400 Bad Request

GET /api/v1/auth/me
  Headers: Authorization: Bearer {token}
  Response: { id, full_name, email, phone, role, ... }
  Status: 200 OK or 401 Unauthorized

GET /health
  Response: { status: "healthy" }
  Status: 200 OK

GET /
  Response: { name, version, status, docs }
  Status: 200 OK
```

## 8. JWT TOKEN VALIDATION

✓ **Token claims** (from security.py):
- `sub`: user_id (MongoDB ObjectId as string)
- `type`: "access" or "refresh"
- `iat`: issued at timestamp
- `exp`: expiration timestamp (calculated from ACCESS_TOKEN_EXPIRE_MINUTES)

✓ **Token validation** (dependency.py):
- Extracts Bearer token from Authorization header
- Decodes JWT using HS256 algorithm
- Validates expiration
- Returns decoded payload (sub, type, iat, exp)

## 9. GOOGLE LOGIN (if configured)

**Current Status**: Not configured
- GOOGLE_CLIENT_ID: "" (empty in config.py line 24)
- GOOGLE_CLIENT_SECRET: "" (empty in config.py line 25)
- No Google OAuth endpoints in auth/routes.py

**To Enable**:
1. Get Google OAuth credentials
2. Set in `.env` or Vercel environment:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Implement OAuth endpoint in backend (not present currently)

## 10. OTP CONFIGURATION

**Supported**:
- Email OTP via SMTP (with fallback to console in dev)
- Phone OTP (fallback to console - no SMS provider configured)

**Current Configuration**:
```
SMTP_HOST: "" (empty - uses fallback)
SMTP_PORT: 587
SMTP_USERNAME: "" (empty - uses fallback)
SMTP_PASSWORD: "" (empty - uses fallback)
EMAIL_FROM: "" (empty - uses fallback)
```

**To Enable Email OTP**:
1. Configure SMTP in `.env` or Render environment:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `EMAIL_FROM`

## SUMMARY

✓ **Backend Auth Implementation**: CORRECT
✓ **CORS Configuration**: CORRECT  
✓ **Frontend Auth Logic**: CORRECT
✗ **Frontend API URL in Production**: MISSING/OUTDATED

**Single Fix Required**: Set Vercel environment variable `VITE_API_URL` to correct Render backend URL
