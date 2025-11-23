# Configuration Files

This directory contains configuration templates for the project.

## Backend Configuration

Backend configuration templates are in `backend/` folder. Copy these templates to `backend/src/main/resources/` and update with your actual values:

```bash
# Copy templates
cp config/backend/*.template backend/src/main/resources/

# Rename files (remove .template extension)
# Then edit the files with your actual configuration values
```

### Files:
- `application.properties.template` - Main application configuration
- `application-dev.properties.template` - Development profile
- `application-prod.properties.template` - Production profile

## Frontend Configuration

Frontend configuration template is in `frontend/` folder. Copy to `frontend/` directory:

```bash
# Copy template
cp config/frontend/.env.template frontend/.env

# Edit with your actual values
```

### Files:
- `.env.template` - Frontend environment variables

## Setup Instructions

1. **Backend Setup:**
   - Copy templates from `config/backend/` to `backend/src/main/resources/`
   - Remove `.template` extension
   - Update database credentials, JWT secrets, and OAuth2 credentials

2. **Frontend Setup:**
   - Copy `.env.template` from `config/frontend/` to `frontend/`
   - Rename to `.env`
   - Update API URLs and feature flags as needed

## Security Notes

⚠️ **Never commit actual configuration files with secrets to version control!**

- Keep `.env` files in `.gitignore`
- Use environment variables in production
- Use secrets management services for production deployments

## Environment Variables (.env example)

Use the following as a reference when creating your `.env` (do not commit real secrets):

```
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
APP_FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=please_replace_with_a_random_32_chars_min_value________________
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
BCRYPT_COST_FACTOR=12

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_ALLOWED_HEADERS=*
CORS_ALLOW_CREDENTIALS=true

# Database
DB_URL=jdbc:mysql://localhost:3306/selfcar_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=password
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=900000

# Payments (sandbox by default)
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENVIRONMENT=sandbox
MOMO_PARTNER_NAME=Selfcar
MOMO_STORE_ID=SelfcarStore

ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=
ZALOPAY_ENVIRONMENT=sandbox

STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_ENVIRONMENT=sandbox

# OAuth2 Providers (uncomment as needed)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# FACEBOOK_CLIENT_ID=
# FACEBOOK_CLIENT_SECRET=

# AWS / S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_S3_REGION=us-east-1
AWS_CDN_DOMAIN=

# Frontend CDN
VITE_CDN_ENABLED=false
VITE_CDN_BASE_URL=

# Logging
LOG_LEVEL_ROOT=INFO
LOG_LEVEL_APP=INFO
LOG_LEVEL_SECURITY=WARN
LOG_LEVEL_SQL=WARN
LOG_LEVEL_SQL_BINDER=WARN

# Management & Misc
MANAGEMENT_PORT=8080
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_LISTINGS=listing-events
KAFKA_TOPIC_ORDERS=orders-events
KAFKA_TOPIC_PAYMENTS=payments-events
KAFKA_TOPIC_INVENTORY=inventory-events
SEARCH_INDEX_LISTINGS=listings
ELASTIC_HOSTS=localhost:9200
```

Notes:
- In `prod`, `JWT_SECRET` must be at least 32 characters; startup will fail otherwise.
- Set secrets via your deployment platform (Render/Heroku/Docker/K8s), not in Git.

