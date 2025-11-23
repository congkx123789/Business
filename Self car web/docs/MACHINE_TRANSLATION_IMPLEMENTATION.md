# Machine Translation Implementation Guide

## Overview

This document describes the implementation of free (or near-free) machine translation using Google Cloud Translation API's free tier (500,000 characters/month) with LibreTranslate fallback option.

## Architecture

### Backend Components

1. **TranslationService** (`com.selfcar.service.translation.TranslationService`)
   - Main translation service with caching (Translation Memory)
   - Supports Google Cloud Translation and LibreTranslate fallback
   - Auto-detects source language
   - Applies glossary for brand/auto terms

2. **GoogleTranslationProvider** (`com.selfcar.service.translation.GoogleTranslationProvider`)
   - Google Cloud Translation API integration
   - Uses Basic model (not LLM) to stay within free tier
   - Conditionally enabled via `translation.google.enabled`

3. **LibreTranslateProvider** (`com.selfcar.service.translation.LibreTranslateProvider`)
   - Self-hosted fallback option
   - Free, open-source translation API
   - Conditionally enabled via `translation.libretranslate.enabled`

4. **GlossaryService** (`com.selfcar.service.translation.GlossaryService`)
   - Handles brand/auto terms that should not be translated
   - Uses JSON glossary file (`glossary.json`)

5. **TranslationController** (`com.selfcar.controller.translation.TranslationController`)
   - REST API endpoints for translation
   - Never exposes API keys to browser

6. **TranslationCLI** (`com.selfcar.cli.TranslationCLI`)
   - Batch translation CLI tool
   - Pre-translates i18n JSON files offline

### Frontend Components

1. **TranslateButton** (`frontend/src/components/Shared/TranslateButton.jsx`)
   - UI component for translating UGC content
   - Shows "Translate" button, then "Show original" toggle
   - Accessible and theme-aware

2. **Translation Utilities** (`frontend/src/utils/translation.js`)
   - Client-side translation API calls
   - All translation happens server-side (no API keys exposed)

3. **useContentTranslation Hook** (`frontend/src/hooks/useTranslation.js`)
   - React hook for easy translation state management

## Setup Instructions

### Week 1: Google Cloud Translation Setup

1. **Create GCP Project**
   ```bash
   # Install Google Cloud SDK if not already installed
   # https://cloud.google.com/sdk/docs/install
   
   gcloud projects create selfcar-translation --name="SelfCar Translation"
   gcloud config set project selfcar-translation
   ```

2. **Enable Translation API**
   ```bash
   gcloud services enable translate.googleapis.com
   ```

3. **Create Service Account (Optional - API Key is simpler)**
   ```bash
   gcloud iam service-accounts create translation-service \
     --display-name="Translation Service"
   
   gcloud projects add-iam-policy-binding selfcar-translation \
     --member="serviceAccount:translation-service@selfcar-translation.iam.gserviceaccount.com" \
     --role="roles/cloudtranslate.user"
   
   gcloud iam service-accounts keys create translation-key.json \
     --iam-account=translation-service@selfcar-translation.iam.gserviceaccount.com
   ```

4. **Or Create API Key (Simpler)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Create API Key
   - Restrict to Cloud Translation API only

5. **Set Quotas & Budget Alerts**
   - Go to APIs & Services > Quotas
   - Set quota limit to 500,000 characters/month (free tier)
   - Set budget alert at 450,000 characters (90% threshold)
   - Create billing alert to notify if approaching free tier limit

6. **Configure Backend**
   ```properties
   # application.properties or environment variables
   translation.google.enabled=true
   translation.google.api-key=YOUR_API_KEY
   # OR
   translation.google.credentials-path=/path/to/translation-key.json
   translation.google.model=base  # Use Basic model (free tier)
   ```

### Week 2: Backend Translation Service

The backend service is already implemented. Key features:

- **Translation Memory Cache**: Caches translations to avoid duplicate API calls
- **Glossary Support**: Preserves brand/auto terms (BMW, Mercedes-Benz, etc.)
- **Fallback**: LibreTranslate if Google Cloud unavailable
- **Batch Translation**: Efficient batch API calls

**Testing the Service:**
```bash
# Test translation endpoint
curl -X POST http://localhost:8080/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test message",
    "sourceLanguage": "en",
    "targetLanguage": "th"
  }'
```

### Week 3: UI Integration

#### Example: Add Translation to Car Reviews

```jsx
import TranslateButton from '../Shared/TranslateButton'

const CarReview = ({ review }) => {
  return (
    <div className="review">
      <TranslateButton 
        text={review.content} 
        sourceLanguage={review.language}
      />
    </div>
  )
}
```

#### Example: Add Translation to Chat Messages

```jsx
import { useContentTranslation } from '../../hooks/useTranslation'
import { usePreferencesStore } from '../../store/preferencesStore'

const ChatMessage = ({ message }) => {
  const { locale } = usePreferencesStore()
  const targetLanguage = locale?.split('-')[0] || 'en'
  
  const {
    displayText,
    isTranslating,
    translate,
    toggleView,
    showOriginal,
  } = useContentTranslation(message.text, message.language)
  
  return (
    <div className="chat-message">
      <p>{displayText}</p>
      <button onClick={() => translate(targetLanguage)}>
        {isTranslating ? 'Translating...' : 'Translate'}
      </button>
      {translatedText && (
        <button onClick={toggleView}>
          {showOriginal ? 'Show translation' : 'Show original'}
        </button>
      )}
    </div>
  )
}
```

## Batch Translation CLI

Pre-translate i18n JSON files offline to reduce API usage:

```bash
# Run batch translation
java -jar backend/target/selfcar-backend-1.0.0.jar \
  --spring.main.web-application-type=none \
  --translation.cli.enabled=true \
  --translation.cli.source-locale=en \
  --translation.cli.target-locale=th \
  --translation.cli.input-path=frontend/src/i18n/locales \
  --translation.cli.output-path=frontend/src/i18n/locales
```

This will:
1. Read all JSON files from `frontend/src/i18n/locales/en/`
2. Translate all string values to Thai
3. Save translated files to `frontend/src/i18n/locales/th/`

## LibreTranslate Fallback (Optional)

If you want to self-host LibreTranslate as a fallback:

1. **Install LibreTranslate**
   ```bash
   # Using Docker (recommended)
   docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
   ```

2. **Configure Backend**
   ```properties
   translation.libretranslate.enabled=true
   translation.libretranslate.base-url=http://localhost:5000
   ```

3. **Benefits**
   - No API costs
   - Privacy (no data sent to external services)
   - Works offline

## Glossary Configuration

Edit `backend/src/main/resources/glossary.json` to add brand/auto terms:

```json
{
  "en-th": {
    "SelfCar": "SelfCar",
    "BMW": "BMW",
    "Mercedes-Benz": "Mercedes-Benz"
  }
}
```

Terms in the glossary will not be translated, preserving brand names.

## API Endpoints

### POST `/api/translation/translate`
Translate single text.

**Request:**
```json
{
  "text": "Hello world",
  "sourceLanguage": "en",
  "targetLanguage": "th"
}
```

**Response:**
```json
{
  "translatedText": "สวัสดีชาวโลก",
  "sourceLanguage": "en",
  "targetLanguage": "th"
}
```

### POST `/api/translation/translate/batch`
Batch translate multiple texts.

### POST `/api/translation/detect`
Detect language of text.

### GET `/api/translation/languages`
Get supported languages.

## Cost Management

### Free Tier Limits

- **Google Cloud Translation**: 500,000 characters/month (free)
- **New GCP accounts**: $300 credits for 90 days

### Staying Within Free Tier

1. **Use Translation Memory Cache**: Already implemented
2. **Pre-translate Static Content**: Use batch CLI
3. **Use Glossary**: Avoid translating brand names
4. **Monitor Usage**: Set up quota alerts
5. **Fallback to LibreTranslate**: For high-volume scenarios

### Monitoring

Check translation usage:
```bash
# View Google Cloud quotas
gcloud services list --enabled
gcloud alpha services quota list --service=translate.googleapis.com
```

## Security

- **Never expose API keys in frontend**: All translation happens server-side
- **API key restrictions**: Restrict to Cloud Translation API only
- **Rate limiting**: Consider adding rate limits to prevent abuse
- **Input validation**: Max text length enforced (5000 characters)

## Testing

```bash
# Test translation service
cd backend
mvn test -Dtest=TranslationServiceTest

# Test API endpoints
curl -X POST http://localhost:8080/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","sourceLanguage":"en","targetLanguage":"th"}'
```

## Troubleshooting

### Google Cloud Translation Not Working

1. Check API key is set correctly
2. Verify Translation API is enabled
3. Check quotas haven't been exceeded
4. Review logs for error messages

### LibreTranslate Not Available

1. Verify LibreTranslate is running: `curl http://localhost:5000/languages`
2. Check base URL configuration
3. Verify network connectivity

### Translations Not Cached

1. Check cache is enabled: `translation.cache.enabled=true`
2. Verify Redis is running (if using Redis cache)
3. Check cache TTL settings

## Future Enhancements

1. **In-Context Editing**: Allow users to edit translations
2. **Translation Quality**: Add confidence scores
3. **SEO Optimization**: Generate translated URLs
4. **Analytics**: Track translation usage and costs
5. **User Preferences**: Remember user's translation preferences

## References

- [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate)
- [Translation Memory Best Practices](https://www.trados.com/solutions/translation-memory/)

