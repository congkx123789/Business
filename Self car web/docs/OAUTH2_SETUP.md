# 🔐 OAuth2 Authorization Setup Guide

This guide will help you set up OAuth2 authentication with Google, GitHub, and Facebook for the SelfCar application.

---

## 📋 Overview

OAuth2 allows users to sign in using their social media accounts (Google, GitHub, Facebook) instead of creating a new account. The implementation includes:

- ✅ Google OAuth2
- ✅ GitHub OAuth2  
- ✅ Facebook OAuth2
- ✅ Automatic user account creation
- ✅ JWT token generation after OAuth2 login
- ✅ Seamless integration with existing authentication

---

## 🚀 Quick Setup

### Step 1: Update Database Schema

Run the OAuth2 migration script:

```bash
cd database
mysql -u root -p selfcar_db < oauth2_migration.sql
```

This adds:
- `oauth_provider` column (google, github, facebook, or null)
- `oauth_provider_id` column (provider-specific user ID)
- Makes `phone` and `password` nullable for OAuth users
- Adds index for OAuth lookups

---

## 🔑 Step 2: Configure OAuth2 Providers

### Google OAuth2 Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     http://localhost:8080/oauth2/callback/google
     ```

4. **Copy Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
   ```

---

### GitHub OAuth2 Setup

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Create OAuth App**
   - **Application name:** SelfCar
   - **Homepage URL:** http://localhost:5173
   - **Authorization callback URL:**
     ```
     http://localhost:8080/oauth2/callback/github
     ```

3. **Copy Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
   spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET
   ```

---

### Facebook OAuth2 Setup

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Click "My Apps" > "Create App"

2. **Create App**
   - Choose "Consumer" app type
   - Fill in app details
   - Add "Facebook Login" product

3. **Configure OAuth Settings**
   - Go to "Settings" > "Basic"
   - Add **Valid OAuth Redirect URIs:**
     ```
     http://localhost:8080/oauth2/callback/facebook
     ```
   - Go to "Settings" > "Facebook Login" > "Settings"
   - Add **Authorized Redirect URIs:**
     ```
     http://localhost:8080/oauth2/callback/facebook
     ```

4. **Copy Credentials**
   - Copy **App ID** and **App Secret**
   - Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.security.oauth2.client.registration.facebook.client-id=YOUR_FACEBOOK_APP_ID
   spring.security.oauth2.client.registration.facebook.client-secret=YOUR_FACEBOOK_APP_SECRET
   ```

---

## ⚙️ Step 3: Update Configuration File

Edit `backend/src/main/resources/application.properties`:

```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

# GitHub OAuth2
spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET

# Facebook OAuth2
spring.security.oauth2.client.registration.facebook.client-id=YOUR_FACEBOOK_APP_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_FACEBOOK_APP_SECRET
```

**Replace placeholders with your actual credentials!**

---

## 🧪 Step 4: Test OAuth2 Login

1. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Login**
   - Go to http://localhost:5173/login
   - Click "Continue with Google/GitHub/Facebook"
   - You'll be redirected to the provider's login page
   - After authentication, you'll be redirected back with a JWT token
   - You're now logged in!

---

## 📱 How It Works

### Authentication Flow

```
1. User clicks "Continue with Google"
   ↓
2. Redirected to Google login page
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to: /oauth2/callback/google
   ↓
5. OAuth2SuccessHandler processes authentication
   ↓
6. User is found or created in database
   ↓
7. JWT token is generated
   ↓
8. User redirected to frontend with token
   ↓
9. Frontend stores token and logs user in
```

### User Creation

- If user **doesn't exist**: New account is created automatically
- If user **exists**: Existing account is used
- OAuth provider info is stored in database
- Phone number defaults to "000-000-0000" (can be updated later)

---

## 🎨 Frontend Integration

OAuth2 buttons are already integrated in the Login page:

```jsx
// frontend/src/pages/Login.jsx
<a href="http://localhost:8080/oauth2/authorization/google">
  Continue with Google
</a>
```

The callback handler (`OAuth2Callback.jsx`) automatically:
- Extracts JWT token from URL
- Fetches user details
- Stores authentication
- Redirects to dashboard/home

---

## 🔒 Security Notes

1. **Never commit credentials** to version control
2. **Use environment variables** in production:
   ```properties
   spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
   ```
3. **Update redirect URIs** for production URLs
4. **Use HTTPS** in production
5. **Regularly rotate** OAuth secrets

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution:**
- Verify redirect URI in provider settings matches exactly
- Check for trailing slashes
- Ensure protocol matches (http vs https)

### Issue: "Invalid client credentials"

**Solution:**
- Verify Client ID and Secret are correct
- Check for extra spaces in configuration
- Ensure credentials are for the correct environment

### Issue: "User not found after OAuth login"

**Solution:**
- Check database connection
- Verify OAuth2 migration ran successfully
- Check backend logs for errors

### Issue: "CORS error"

**Solution:**
- Verify CORS configuration in `SecurityConfig.java`
- Check frontend URL matches allowed origins
- Ensure credentials are included in CORS

---

## 📊 Database Schema Updates

After running the migration, your `users` table will have:

```sql
- oauth_provider VARCHAR(50) NULL
  -- Values: 'google', 'github', 'facebook', NULL (for local users)
  
- oauth_provider_id VARCHAR(255) NULL
  -- Provider-specific user ID
  
- phone VARCHAR(20) NULL (was NOT NULL)
- password VARCHAR(255) NULL (was NOT NULL)
```

---

## 🚀 Production Deployment

### Update Redirect URIs

Change redirect URIs in provider settings:

**Google:**
```
https://yourdomain.com/oauth2/callback/google
```

**GitHub:**
```
https://yourdomain.com/oauth2/callback/github
```

**Facebook:**
```
https://yourdomain.com/oauth2/callback/facebook
```

### Update application.properties

```properties
# Production URLs
spring.security.oauth2.client.registration.google.redirect-uri=https://yourdomain.com/oauth2/callback/google
spring.security.oauth2.client.registration.github.redirect-uri=https://yourdomain.com/oauth2/callback/github
spring.security.oauth2.client.registration.facebook.redirect-uri=https://yourdomain.com/oauth2/callback/facebook
```

### Update OAuth2SuccessHandler

Update redirect URL in `OAuth2SuccessHandler.java`:

```java
String redirectUrl = String.format("https://yourdomain.com/auth/oauth2/callback?token=%s", token);
```

---

## ✅ Checklist

Before going live:

- [ ] All OAuth2 providers configured
- [ ] Database migration executed
- [ ] Credentials updated in application.properties
- [ ] Redirect URIs configured correctly
- [ ] Tested with all three providers
- [ ] Production URLs updated
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Secrets secured (not in code)

---

## 📚 Additional Resources

- [Google OAuth2 Docs](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth2 Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Facebook OAuth2 Docs](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
- [Spring OAuth2 Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)

---

## 🎉 Success!

If everything is configured correctly:

- ✅ Users can click OAuth2 buttons on login page
- ✅ They're redirected to provider login
- ✅ After authentication, they're logged into SelfCar
- ✅ JWT token is stored and used for API calls
- ✅ User account is created automatically if new

---

**Need Help?** Check backend logs for detailed error messages.

**Last Updated:** November 2025

