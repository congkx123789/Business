# Environment Variables Setup Guide

This guide explains how to set up environment variables for the SelfCar application.

---

## 📋 Quick Start

### For Local Development

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your local values:**
   ```bash
   # Minimum required for development
   JWT_SECRET=your_dev_secret_key_at_least_32_characters_long
   DB_URL=jdbc:mysql://localhost:3306/selfcar_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

3. **Load environment variables:**
   - **Windows (PowerShell):** Use `dotenv-cli` or set variables manually
   - **Linux/Mac:** Use `export` or `source .env`

### For Production

**DO NOT** use `.env` files in production. Instead, set environment variables through your hosting platform:

- **Docker:** Use `docker-compose.yml` or `-e` flags
- **Kubernetes:** Use `ConfigMap` and `Secrets`
- **Cloud Platforms (AWS, Azure, GCP):** Use their secret management services
- **Traditional Servers:** Set in `/etc/environment` or systemd service files

---

## 🔐 Required Environment Variables

### Critical (Must Set)

| Variable | Description | Example | Required In |
|----------|-------------|---------|-------------|
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `openssl rand -base64 32` | All environments |
| `DB_URL` | Database connection URL | `jdbc:mysql://localhost:3306/selfcar_db` | All environments |
| `DB_USERNAME` | Database username | `root` | All environments |
| `DB_PASSWORD` | Database password | `your_secure_password` | All environments |

### Production Only (Must Set)

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_FRONTEND_URL` | Frontend application URL | `https://selfcar.com` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `https://selfcar.com` |
| `PAYMENT_BASE_URL` | Payment callback base URL | `https://selfcar.com` |

### Optional (OAuth2)

| Variable | Description | Required For |
|----------|-------------|---------------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Google login |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 client ID | GitHub login |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 client secret | GitHub login |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth2 app ID | Facebook login |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth2 app secret | Facebook login |

### Optional (Payment Gateways)

| Variable | Description | Required For |
|----------|-------------|---------------|
| `MOMO_PARTNER_CODE` | Momo partner code | Momo payments |
| `MOMO_ACCESS_KEY` | Momo access key | Momo payments |
| `MOMO_SECRET_KEY` | Momo secret key | Momo payments |
| `ZALOPAY_APP_ID` | ZaloPay app ID | ZaloPay payments |
| `ZALOPAY_KEY1` | ZaloPay key 1 | ZaloPay payments |
| `ZALOPAY_KEY2` | ZaloPay key 2 | ZaloPay payments |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe payments |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe payments |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Connect client ID | Stripe Connect |

---

## 🔑 Generating Secure Secrets

### Generate JWT Secret

**Using OpenSSL (Recommended):**
```bash
openssl rand -base64 32
```

**Using Python:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

**Using Node.js:**
```javascript
require('crypto').randomBytes(32).toString('base64')
```

**Minimum Requirements:**
- At least 32 characters (256 bits)
- Use cryptographically secure random generator
- Never share or commit to version control

---

## 📝 Example .env File

Create `backend/.env` (DO NOT COMMIT):

```bash
# Application
APP_FRONTEND_URL=http://localhost:5173
SPRING_PROFILES_ACTIVE=dev

# Database
DB_URL=jdbc:mysql://localhost:3306/selfcar_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_local_password

# JWT (Generate using: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_key_at_least_32_characters_long
JWT_EXPIRATION=86400000

# OAuth2 (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Payment Gateways (Optional)
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENVIRONMENT=sandbox

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🚀 Setting Environment Variables

### Windows (PowerShell)

**Temporary (for current session):**
```powershell
$env:JWT_SECRET="your_secret_here"
$env:DB_URL="jdbc:mysql://localhost:3306/selfcar_db"
```

**Permanent (User-level):**
```powershell
[System.Environment]::SetEnvironmentVariable("JWT_SECRET", "your_secret_here", "User")
```

**Using .env file with dotenv-cli:**
```powershell
npm install -g dotenv-cli
dotenv -e .env -- mvn spring-boot:run
```

### Linux/Mac (Bash)

**Temporary (for current session):**
```bash
export JWT_SECRET="your_secret_here"
export DB_URL="jdbc:mysql://localhost:3306/selfcar_db"
```

**Load from .env file:**
```bash
export $(cat .env | xargs)
```

**Permanent (Add to ~/.bashrc or ~/.zshrc):**
```bash
echo 'export JWT_SECRET="your_secret_here"' >> ~/.bashrc
source ~/.bashrc
```

### Docker

**docker-compose.yml:**
```yaml
services:
  backend:
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DB_URL=${DB_URL}
    env_file:
      - .env
```

**docker run:**
```bash
docker run -e JWT_SECRET="your_secret" -e DB_URL="jdbc:mysql://..." your-image
```

### Kubernetes

**ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: selfcar-config
data:
  DB_URL: "jdbc:mysql://..."
  CORS_ALLOWED_ORIGINS: "https://selfcar.com"
```

**Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: selfcar-secrets
type: Opaque
stringData:
  JWT_SECRET: "your_secret_here"
  DB_PASSWORD: "your_password"
```

---

## ✅ Validation

The application will validate environment variables on startup:

- **JWT_SECRET:** Must be at least 32 characters in production
- **Database credentials:** Must be set and valid
- **Production profile:** All required variables must be set

If validation fails, the application will not start and will display clear error messages.

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different secrets** for dev, staging, and production
3. **Rotate secrets regularly** (especially JWT_SECRET)
4. **Use secret management services** in production (AWS Secrets Manager, HashiCorp Vault, etc.)
5. **Restrict access** to environment variables
6. **Log variable names, not values** (never log secrets)
7. **Use least privilege** for database credentials

---

## 📚 Related Documentation

- [Production Improvement Roadmap](./PRODUCTION_IMPROVEMENT_ROADMAP.md)
- [Quick Start Production Guide](./QUICK_START_PRODUCTION.md)
- [Configuration Guide](../config/README.md)

---

**Last Updated:** [Current Date]  
**Next Steps:** Set up your environment variables and test the application startup.

