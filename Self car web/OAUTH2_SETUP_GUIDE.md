# OAuth2 Social Login Setup Guide

This guide will help you set up Google, Facebook, and GitHub OAuth2 authentication for your SelfCar application.

## Table of Contents
1. [Google OAuth2 Setup](#google-oauth2-setup)
2. [GitHub OAuth2 Setup](#github-oauth2-setup)
3. [Facebook OAuth2 Setup](#facebook-oauth2-setup)
4. [Configuration](#configuration)
5. [Testing](#testing)

---

## Google OAuth2 Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `SelfCar OAuth2` (or any name)
4. Click **"Create"**

### Step 2: Enable Google+ API
1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click **"Enable"**

### Step 3: Create OAuth2 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External (for testing) or Internal (for organization)
   - **App name**: SelfCar
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"**
   - **Scopes**: Click **"Save and Continue"** (default scopes are fine)
   - **Test users**: Add your email, click **"Save and Continue"**
   - Click **"Back to Dashboard"**

4. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: SelfCar Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:8080
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:8080/login/oauth2/code/google
     ```
   - Click **"Create"**

5. Copy the **Client ID** and **Client Secret**

---

## GitHub OAuth2 Setup

### Step 1: Create GitHub OAuth App
1. Go to your GitHub account → **Settings** → **Developer settings**
   - Or visit: https://github.com/settings/developers
2. Click **"OAuth Apps"** → **"New OAuth App"**

### Step 2: Configure OAuth App
1. Fill in the form:
   - **Application name**: `SelfCar`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: 
     ```
     http://localhost:8080/login/oauth2/code/github
     ```
2. Click **"Register application"**

### Step 3: Get Credentials
1. You'll see the **Client ID** immediately
2. Click **"Generate a new client secret"**
3. Copy both **Client ID** and **Client Secret**

⚠️ **Important**: Save the client secret immediately - you won't be able to see it again!

---

## Facebook OAuth2 Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** or **"Business"** → **"Next"**
4. Fill in:
   - **App name**: `SelfCar`
   - **App contact email**: Your email
5. Click **"Create App"**

### Step 2: Add Facebook Login
1. In the app dashboard, find **"Add Product"**
2. Click **"Set Up"** on **"Facebook Login"**
3. Select **"Web"** platform

### Step 3: Configure Settings
1. Go to **"Settings"** → **"Basic"**
2. Add **App Domains**:
   ```
   localhost
   ```
3. Click **"Add Platform"** → **"Website"**
4. Enter **Site URL**:
   ```
   http://localhost:5173
   ```
5. Go to **"Settings"** → **"Facebook Login"** → **"Settings"**
6. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:8080/login/oauth2/code/facebook
   ```
7. Click **"Save Changes"**

### Step 4: Get Credentials
1. Go to **"Settings"** → **"Basic"**
2. Copy **App ID** (this is your Client ID)
3. Copy **App Secret** (this is your Client Secret)
   - Click **"Show"** to reveal it

### Step 5: App Review (Optional for Testing)
- For testing with your own account, you don't need app review
- For production, you'll need to submit for review

---

## Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env` file in the `backend` directory or set environment variables:

**Windows PowerShell:**
```powershell
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
$env:GITHUB_CLIENT_ID="your-github-client-id"
$env:GITHUB_CLIENT_SECRET="your-github-client-secret"
$env:FACEBOOK_CLIENT_ID="your-facebook-app-id"
$env:FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

**Windows CMD:**
```cmd
set GOOGLE_CLIENT_ID=your-google-client-id
set GOOGLE_CLIENT_SECRET=your-google-client-secret
set GITHUB_CLIENT_ID=your-github-client-id
set GITHUB_CLIENT_SECRET=your-github-client-secret
set FACEBOOK_CLIENT_ID=your-facebook-app-id
set FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

**Linux/Mac:**
```bash
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export GITHUB_CLIENT_ID="your-github-client-id"
export GITHUB_CLIENT_SECRET="your-github-client-secret"
export FACEBOOK_CLIENT_ID="your-facebook-app-id"
export FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

### Option 2: Application Properties

You can also add credentials directly to `application-h2.properties` (not recommended for production):

```properties
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret
spring.security.oauth2.client.registration.github.client-id=your-github-client-id
spring.security.oauth2.client.registration.github.client-secret=your-github-client-secret
spring.security.oauth2.client.registration.facebook.client-id=your-facebook-app-id
spring.security.oauth2.client.registration.facebook.client-secret=your-facebook-app-secret
```

---

## Testing

### 1. Start the Backend
```powershell
cd "D:\Business\Self car web\backend"
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=h2
```

Or with environment variables:
```powershell
$env:GOOGLE_CLIENT_ID="your-id"; $env:GOOGLE_CLIENT_SECRET="your-secret"
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=h2
```

### 2. Start the Frontend
```powershell
cd "D:\Business\Self car web\frontend"
npm run dev
```

### 3. Test OAuth2 Login
1. Open http://localhost:5173/login
2. You should see three buttons:
   - **Continue with Google**
   - **Continue with GitHub**
   - **Continue with Facebook**
3. Click any button to test OAuth2 login
4. You'll be redirected to the provider's login page
5. After authentication, you'll be redirected back to the app

### 4. Verify User Creation
- Check the database to see if the user was created
- The user should have `oauthProvider` and `oauthProviderId` fields populated
- Users created via OAuth2 won't have a password (it's null)

---

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution**: Make sure the redirect URI in your OAuth app matches exactly:
- Google: `http://localhost:8080/login/oauth2/code/google`
- GitHub: `http://localhost:8080/login/oauth2/code/github`
- Facebook: `http://localhost:8080/login/oauth2/code/facebook`

### Issue: "Invalid client credentials"
**Solution**: 
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces
- For Facebook, make sure you're using App ID and App Secret

### Issue: OAuth2 buttons not showing
**Solution**: 
- Check browser console for errors
- Verify the frontend is running on http://localhost:5173
- Check that OAuth2 configuration is loaded

### Issue: "OAuth2 authentication failed"
**Solution**:
- Check backend logs for detailed error messages
- Verify environment variables are set correctly
- Make sure the OAuth app is in "Development" mode (for testing)

---

## Production Deployment

For production, you'll need to:

1. **Update Redirect URIs** to your production domain:
   ```
   https://yourdomain.com/login/oauth2/code/google
   https://yourdomain.com/login/oauth2/code/github
   https://yourdomain.com/login/oauth2/code/facebook
   ```

2. **Update Authorized Origins**:
   ```
   https://yourdomain.com
   ```

3. **Use Environment Variables** or **Secrets Management** (never commit credentials to git)

4. **Complete App Review** (especially for Facebook)

5. **Update CORS settings** in `application.properties`:
   ```properties
   app.frontend.url=https://yourdomain.com
   ```

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit** OAuth credentials to version control
2. **Use environment variables** or secrets management in production
3. **Rotate secrets** regularly
4. **Use HTTPS** in production (OAuth2 requires HTTPS for production)
5. **Limit OAuth scopes** to only what you need
6. **Monitor OAuth usage** for suspicious activity

---

## Quick Reference

### Redirect URIs Summary
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
- Health Check: http://localhost:8080/api/health

---

## Need Help?

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify all redirect URIs match exactly
3. Ensure OAuth apps are in "Development" mode for testing
4. Check browser console for frontend errors

