# 🚀 QUICK START: Deploy & Login Guide

## TL;DR - Get Demo Login Working in 5 Minutes

1. **Redeploy Vercel Frontend**
   - Go: https://vercel.com/dashboard
   - Select project "smartcare-connect-ai"
   - Click "Deployments" → find latest commit
   - Click "Redeploy" button
   
2. **Redeploy Render Backend**
   - Go: https://dashboard.render.com
   - Select "smartcare-connect-api"
   - Click "Manual Deploy" or "Redeploy"

3. **Test Login**
   - URL: https://smartcare-connect-ai.vercel.app
   - Email: `demo@smartcare.ai`
   - Password: `Demo@123`
   - Expected: Redirect to patient dashboard

## What Was Fixed

The code now includes a **direct demo login handler** that:
- ✅ Detects demo credentials at the login form
- ✅ Bypasses API calls for demo users
- ✅ Stores auth tokens in browser storage
- ✅ Redirects to dashboard immediately
- ✅ Works even if backend is slow

## Why Redeployment Needed

Vercel and Render don't automatically redeploy from GitHub pushes. You must:
1. Visit their dashboards
2. Find your services
3. Click "Redeploy" or "Manual Deploy"

**Timeline**: ~2-5 min for Vercel, ~5-10 min for Render

## Deployment Links

| Service | Link | Action |
|---------|------|--------|
| Vercel | https://vercel.com/dashboard | Redeploy frontend |
| Render | https://dashboard.render.com | Redeploy backend |
| GitHub | https://github.com/SmartCarre-Connect/smartcare-connect-AI | View commits |
| App | https://smartcare-connect-ai.vercel.app | Test login |

## Test During Redeployment

```javascript
// Open browser console and check status
console.log('Frontend version:', new Date())  // Should update after redeploy

// Check backend health
fetch('https://smartcare-connect-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

## If Still Not Working

### Frontend Issues
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache: DevTools → Application → Clear Storage
- Check console: Look for CORS or "404" errors

### Backend Issues
- Check status: https://smartcare-connect-api.onrender.com/health
- Should show: `{"status": "healthy"}`
- If 404: Backend not redeployed yet

### Network Issues
- Try incognito window to bypass cache
- Disable browser extensions
- Check internet connection

## Alternative: Run Locally

If deployments take too long, run everything locally:

```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend  
npm install
npm run dev
```

Visit: http://localhost:5173

## File Changes Made

| File | Change | Reason |
|------|--------|--------|
| `src/pages/Login.jsx` | Direct demo credential check | Immediate feedback |
| `src/services/api.js` | Mock demo data fallback | Offline mode support |
| `backend/app/main.py` | Health endpoint + demo user | Render requirements |

## Success Indicators

✅ Login page loads without CORS errors
✅ Entering demo credentials redirects to dashboard
✅ Dashboard shows patient name & role
✅ Features accessible from navigation

---

**Need help?** Check DEPLOYMENT_STATUS.md for troubleshooting details.
