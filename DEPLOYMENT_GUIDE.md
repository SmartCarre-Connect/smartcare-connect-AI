# SmartCare Connect - Deployment Guide

## Quick Start

### Local Development

#### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (or local MongoDB)
- Git

#### Installation

```bash
# Clone repository
git clone https://github.com/SmartCarre-Connect/smartcare-connect-AI.git
cd SmartCare-connect

# Frontend setup
npm install

# Backend setup
cd backend
pip install -r requirements.txt
cd ..
```

#### Configuration

**Frontend .env (optional):**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_BASE_URL=/
```

**Backend .env:**
```env
MONGODB_URL=<your-mongodb-atlas-connection-string>
DATABASE_NAME=smartcare_connect
JWT_SECRET=<generate-secure-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GEMINI_API_KEY=<your-google-gemini-api-key>
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=20971520
```

#### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access application at: `http://localhost:5173`

API Documentation: `http://localhost:8000/docs`

---

## Production Deployment

### Option 1: Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel

1. **Push code to GitHub**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Connect to Vercel**
   - Visit vercel.com
   - Import repository
   - Set framework: Vite
   - Environment variables:
	 ```
	 VITE_API_URL=https://your-backend.onrender.com/api/v1
	 ```
   - Deploy

3. **Enable CORS**
   - Update backend .env: `CORS_ORIGINS=https://your-vercel-app.vercel.app`

#### Backend on Render

1. **Create Render account**
   - Visit render.com
   - Create new Web Service
   - Connect GitHub repository

2. **Configure service**
   - Name: `smartcare-connect-api`
   - Runtime: Python 3
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set environment variables**
   - MongoDB: `MONGODB_URL=<connection-string>`
   - JWT: `JWT_SECRET=<your-secret>`
   - API: `GEMINI_API_KEY=<your-key>`
   - CORS: `CORS_ORIGINS=https://your-vercel-app.vercel.app`

4. **Deploy**
   - Render auto-deploys on git push

---

### Option 2: Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify

1. **Build project**
```bash
npm run build
```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment: Set `VITE_API_URL`

#### Backend on Railway

1. **Create Railway account**
   - Visit railway.app
   - Create project

2. **Add service**
   - Connect GitHub
   - Select repository
   - Database: Add MongoDB

3. **Configure**
   - Set environment variables
   - Deploy

---

### Option 3: Google Cloud Run (both)

#### Frontend

```bash
# Create Dockerfile for frontend
cat > Dockerfile.frontend << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
EOF

# Build and deploy
gcloud builds submit --tag gcr.io/your-project/smartcare-frontend
gcloud run deploy smartcare-frontend --image gcr.io/your-project/smartcare-frontend
```

#### Backend

```bash
# Create Dockerfile for backend
cat > backend/Dockerfile << 'EOF'
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Build and deploy
cd backend
gcloud builds submit --tag gcr.io/your-project/smartcare-backend
gcloud run deploy smartcare-backend --image gcr.io/your-project/smartcare-backend
cd ..
```

---

## Docker Setup (Local or Production)

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
	build:
	  context: ./backend
	  dockerfile: Dockerfile
	ports:
	  - "8000:8000"
	environment:
	  - MONGODB_URL=mongodb://mongo:27017
	  - DATABASE_NAME=smartcare_connect
	  - JWT_SECRET=${JWT_SECRET}
	  - GEMINI_API_KEY=${GEMINI_API_KEY}
	depends_on:
	  - mongo

  frontend:
	build:
	  context: .
	  dockerfile: Dockerfile.frontend
	ports:
	  - "3000:3000"
	environment:
	  - VITE_API_URL=http://backend:8000/api/v1

  mongo:
	image: mongo:6
	ports:
	  - "27017:27017"
	volumes:
	  - mongo_data:/data/db

volumes:
  mongo_data:
```

**Run with Docker Compose:**
```bash
docker-compose up
```

---

## Environment Variables Checklist

### Backend Required
- [ ] `MONGODB_URL` - MongoDB Atlas connection string
- [ ] `DATABASE_NAME` - Database name (default: smartcare_connect)
- [ ] `JWT_SECRET` - Secure random string for JWT signing
- [ ] `GEMINI_API_KEY` - Google Generative AI API key
- [ ] `CORS_ORIGINS` - Comma-separated list of allowed origins

### Backend Optional
- [ ] `JWT_ALGORITHM` - (default: HS256)
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` - (default: 30)
- [ ] `REFRESH_TOKEN_EXPIRE_DAYS` - (default: 7)
- [ ] `UPLOAD_DIR` - (default: uploads)
- [ ] `MAX_UPLOAD_SIZE` - (default: 20971520 bytes)
- [ ] `ENVIRONMENT` - (development/production)

### Frontend Optional
- [ ] `VITE_API_URL` - Backend API URL (default: /api/v1 in dev)
- [ ] `VITE_BASE_URL` - Base path (default: /)

---

## Database Setup

### MongoDB Atlas

1. **Create account**
   - Visit mongodb.com/cloud/atlas
   - Sign up and create organization

2. **Create cluster**
   - Free tier available
   - Name: smartcare-production
   - Region: Choose closest to users

3. **Create database user**
   - Username: smartcare_user
   - Password: (generate secure password)
   - Permissions: Read/Write any database

4. **Get connection string**
   - In Cluster → Connect
   - Select "Connect your application"
   - Copy connection string
   - Replace `<password>` with user password

5. **Create database**
   - Run backend for auto-seeding: `python -m uvicorn app.main:app`
   - Collections created automatically with indexes

---

## Security Considerations

### Before Deployment

- [ ] Change `JWT_SECRET` to secure random value
- [ ] Use HTTPS only in production
- [ ] Set strong MongoDB passwords
- [ ] Enable IP whitelist in MongoDB Atlas
- [ ] Configure rate limiting (enabled by default)
- [ ] Enable audit logging
- [ ] Set up monitoring/alerts
- [ ] Configure automated backups
- [ ] Review CORS origins
- [ ] Enable SSL/TLS for all connections

### Secret Management

**Do NOT commit .env files!**

Use platform secret managers:
- **Render:** Environment variables in dashboard
- **Vercel:** Environment variables in project settings
- **Railway:** Variables in service settings
- **Google Cloud:** Secret Manager
- **AWS:** Secrets Manager / Parameter Store

---

## CI/CD Pipeline Setup

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
	branches: [main]

jobs:
  deploy:
	runs-on: ubuntu-latest

	steps:
	  - uses: actions/checkout@v2

	  - name: Build Frontend
		run: |
		  npm install
		  npm run build

	  - name: Deploy Frontend
		run: |
		  # Deploy to Vercel/Netlify

	  - name: Test Backend
		run: |
		  cd backend
		  pip install -r requirements.txt
		  # python -m pytest

	  - name: Deploy Backend
		run: |
		  # Deploy to Render/Railway
```

---

## Monitoring & Maintenance

### Monitoring

- **Frontend:** Use Vercel Analytics or Sentry
- **Backend:** Check logs with `heroku logs --tail`
- **Database:** MongoDB Atlas monitoring dashboard
- **Performance:** Monitor API response times
- **Errors:** Set up error tracking (Sentry, Rollbar)

### Backups

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/smartcare_connect" --out=backup

# Restore MongoDB
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net" backup/smartcare_connect
```

### Updates

```bash
# Update dependencies
npm update
pip list --outdated
pip install --upgrade -r requirements.txt

# Security scanning
npm audit
pip install safety && safety check
```

---

## Troubleshooting

### Common Issues

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` is correct
- Check CORS configuration
- Verify backend is running
- Check firewall rules

**MongoDB connection timeout:**
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Verify credentials
- Test with MongoDB Compass

**JWT token errors:**
- Verify `JWT_SECRET` matches between restarts
- Check token expiration (default 30 min)
- Clear browser cache/localStorage

**File upload fails:**
- Check file size < 20MB
- Verify `/uploads` directory exists
- Check file permissions
- Verify disk space available

**HeyGen generation stuck:**
- Verify API key and credits
- Check job status endpoint
- Check logs for errors
- Verify script content

---

## Performance Optimization

### Frontend

```bash
# Reduce bundle size
npm run build -- --analyze

# Enable code splitting
# See vite.config.ts for route-based splitting
```

### Backend

```python
# Enable caching headers
# Add connection pooling
# Optimize database queries
# Use pagination for large lists
```

### Database

```javascript
// Ensure indexes are present
db.createIndex() // Called on startup

// Monitor slow queries
db.setProfilingLevel(1)
```

---

## Scaling Considerations

1. **Frontend:** CDN distribution (Vercel, Netlify handles this)
2. **Backend:** Multiple instances with load balancer
3. **Database:** MongoDB sharding for large datasets
4. **Caching:** Redis for session/cache layer
5. **Async Jobs:** Message queue (RabbitMQ, Celery) for background tasks

---

## Support & Documentation

- **API Docs:** `https://your-backend/docs`
- **GitHub:** `https://github.com/SmartCarre-Connect/smartcare-connect-AI`
- **Issues:** Report via GitHub Issues
- **Discord/Community:** (if available)

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Database seeded with initial data
- [ ] Frontend build successful
- [ ] Backend tests passing
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Security review completed
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Team trained on deployment
- [ ] Rollback plan documented
- [ ] On-call support assigned

---

**Last Updated:** 2026-08-02  
**Version:** 1.0  
**Status:** Ready for Production Deployment
