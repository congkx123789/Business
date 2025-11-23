# OAuth2 Quick Start Guide

## ✅ What's Already Configured

Your application already has OAuth2 support configured! You just need to:

1. **Get OAuth2 credentials** from Google, GitHub, and Facebook
2. **Set environment variables** with your credentials
3. **Restart the backend**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get OAuth2 Credentials

Follow the detailed guide in `OAUTH2_SETUP_GUIDE.md` to get credentials from each provider:

- **Google**: https://console.cloud.google.com/
- **GitHub**: https://github.com/settings/developers
- **Facebook**: https://developers.facebook.com/

**Quick Redirect URIs you'll need:**
```
Google:   http://localhost:8080/login/oauth2/code/google
GitHub:   http://localhost:8080/login/oauth2/code/github
Facebook: http://localhost:8080/login/oauth2/code/facebook
```

### Step 2: Set Environment Variables

**Option A: Use the Setup Script (Easiest)**
```powershell
cd "D:\Business\Self car web\backend"
.\setup-oauth2.ps1
```

**Option B: Set Manually in PowerShell**
```powershell
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
$env:GITHUB_CLIENT_ID="your-github-client-id"
$env:GITHUB_CLIENT_SECRET="your-github-client-secret"
$env:FACEBOOK_CLIENT_ID="your-facebook-app-id"
$env:FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

**Option C: Create .env file in backend directory**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### Step 3: Restart Backend

Stop the current backend (Ctrl+C in the PowerShell window), then restart:

```powershell
cd "D:\Business\Self car web\backend"
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=h2
```

Or if you set environment variables in the same session:
```powershell
$env:GOOGLE_CLIENT_ID="your-id"; $env:GOOGLE_CLIENT_SECRET="your-secret"
# ... set other variables ...
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=h2
```

---

## 🧪 Testing OAuth2 Login

1. **Open the login page**: http://localhost:5173/login
2. **You should see three buttons**:
   - Continue with Google
   - Continue with GitHub
   - Continue with Facebook
3. **Click any button** to test OAuth2 login
4. **You'll be redirected** to the provider's login page
5. **After authentication**, you'll be redirected back to the app

---

## 📋 What Happens During OAuth2 Login

1. User clicks "Continue with Google/GitHub/Facebook"
2. Frontend redirects to: `http://localhost:8080/oauth2/authorization/{provider}`
3. Backend redirects to provider's OAuth2 login page
4. User authenticates with provider
5. Provider redirects back to: `http://localhost:8080/login/oauth2/code/{provider}`
6. Backend creates/updates user account with OAuth2 info
7. Backend generates JWT token
8. User is redirected to frontend with token
9. Frontend stores token and user is logged in

---

## 🔍 Verify It's Working

### Check Backend Logs
When you click an OAuth2 button, you should see in the backend logs:
```
OAuth2 authentication successful for user: user@example.com
```

### Check Database
OAuth2 users will have:
- `oauthProvider`: "google", "github", or "facebook"
- `oauthProviderId`: The provider's user ID
- `password`: null (OAuth2 users don't have passwords)

### Test Login Flow
1. Click OAuth2 button
2. Complete provider authentication
3. You should be redirected back and logged in
4. Check your profile - you should see OAuth2 provider info

---

## ⚠️ Common Issues

### "Redirect URI mismatch"
- **Solution**: Make sure redirect URIs in your OAuth app match exactly:
  - `http://localhost:8080/login/oauth2/code/google`
  - `http://localhost:8080/login/oauth2/code/github`
  - `http://localhost:8080/login/oauth2/code/facebook`

### OAuth2 buttons not showing
- **Solution**: Check browser console for errors
- Verify frontend is running on http://localhost:5173

### "Invalid client credentials"
- **Solution**: Double-check your Client ID and Client Secret
- Make sure there are no extra spaces
- For Facebook, use App ID and App Secret

### OAuth2 not working after setting variables
- **Solution**: Make sure you restarted the backend after setting environment variables
- Environment variables are only available to processes started after they're set

---

## 📚 More Information

- **Detailed Setup Guide**: See `OAUTH2_SETUP_GUIDE.md` for step-by-step instructions
- **Backend Configuration**: `backend/src/main/resources/application-h2.properties`
- **Frontend Login Page**: `frontend/src/pages/Login.jsx`
- **OAuth2 Callback Handler**: `frontend/src/pages/OAuth2Callback.jsx`

---

## 🎯 Quick Reference

### Redirect URIs
```
Google:   http://localhost:8080/login/oauth2/code/google
GitHub:   http://localhost:8080/login/oauth2/code/github
Facebook: http://localhost:8080/login/oauth2/code/facebook
```

### Environment Variables
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
FACEBOOK_CLIENT_ID
FACEBOOK_CLIENT_SECRET
```

### Test URLs
- Frontend: http://localhost:5173/login
- Backend: http://localhost:8080
- Health: http://localhost:8080/api/health

---

## ✨ You're All Set!

Once you've:
1. ✅ Got OAuth2 credentials from providers
2. ✅ Set environment variables
3. ✅ Restarted the backend

You can use Google, GitHub, and Facebook login! 🎉

