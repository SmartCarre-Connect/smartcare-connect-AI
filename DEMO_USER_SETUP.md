# SmartCare Connect - Demo User Setup

## ✅ Demo User Configuration

### Credentials
- **Email**: demo@smartcare.ai
- **Password**: Demo@123
- **Role**: Patient

### Features
✅ Automatically created on first application startup
✅ Uses normal authentication flow (password hashed with bcrypt)
✅ Full integration with MongoDB
✅ JWT tokens generated on login
✅ Can access all patient features
✅ Existing authentication system preserved

## How It Works

### Automatic Creation
When the backend starts:
1. Connects to MongoDB
2. Checks if `demo@smartcare.ai` already exists
3. If not, creates demo user with:
   - Hashed password (Demo@123)
   - Patient role
   - Demo patient profile
   - Verified status
4. Logs confirmation message

### Login Flow
1. POST `/api/v1/auth/login`
2. Credentials validated against MongoDB
3. Password verified using bcrypt
4. JWT access token generated
5. User can access protected endpoints

## Testing Demo Login

### Test Command
```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/auth/login' `
  -Method Post `
  -Body '{"email":"demo@smartcare.ai","password":"Demo@123"}' `
  -ContentType 'application/json'
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
	"access_token": "eyJ...",
	"refresh_token": "eyJ...",
	"token_type": "bearer",
	"role": "patient",
	"user_id": "...",
	"full_name": "Demo Patient",
	"email": "demo@smartcare.ai"
  }
}
```

## Files Modified
- `backend/app/main.py` - Added demo user creation in lifespan
- `backend/app/utils/demo.py` - Demo user creation logic

## Security Notes
- ✅ Password is hashed using bcrypt (not stored in plain text)
- ✅ No authentication bypass (uses normal login flow)
- ✅ JWT tokens require valid credentials
- ✅ Normal role-based access control applies
- ✅ Can be easily removed by deleting from MongoDB

## Next Steps for Deployment
1. Demo user is persistent in MongoDB
2. Can be deleted by removing the record
3. Will be recreated on next backend restart if deleted
4. Optional: Add environment variable to disable demo user creation in production
