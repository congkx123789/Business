# Machine Translation Quick Start Guide

## Quick Setup (5 minutes)

### 1. Enable Google Cloud Translation API

```bash
# Set environment variable
export GOOGLE_TRANSLATION_ENABLED=true
export GOOGLE_TRANSLATION_API_KEY=your_api_key_here
```

Or add to `application.properties`:
```properties
translation.google.enabled=true
translation.google.api-key=your_api_key_here
translation.google.model=base
```

### 2. Test Translation API

```bash
curl -X POST http://localhost:8080/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test",
    "sourceLanguage": "en",
    "targetLanguage": "th"
  }'
```

### 3. Use in Frontend

```jsx
import TranslateButton from '../Shared/TranslateButton'

// In your component
<TranslateButton 
  text={review.content} 
  sourceLanguage={review.language}
/>
```

## Free Tier Limits

- **500,000 characters/month** free with Google Cloud Translation
- **Translation Memory Cache** reduces API calls
- **Batch CLI** pre-translates static content

## Next Steps

1. Read full documentation: `docs/MACHINE_TRANSLATION_IMPLEMENTATION.md`
2. Set up quota alerts in Google Cloud Console
3. Pre-translate i18n files using batch CLI
4. Add glossary terms for brand names

## Troubleshooting

- **API not working?** Check API key is set correctly
- **Out of quota?** Enable LibreTranslate fallback
- **Translations slow?** Check cache is enabled

