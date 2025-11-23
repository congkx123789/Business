# AI Service

AI-powered helper for the reading platform. Centralizes summarization, translation, dictionary, narration/TTS, recommendations, and lightweight content generation. All logic is exposed through a NestJS gRPC server (port `3005` HTTP listener + default gRPC endpoint from `AI_SERVICE_GRPC_URL`).

## Architecture

- **Communication**: NestJS gRPC microservice (`ai.controller.ts`) + HTTP health server
- **Port Allocation**: HTTP `3005` (`AI_SERVICE_PORT`), gRPC socket `AI_SERVICE_GRPC_URL` (defaults to `0.0.0.0:50055`)
- **Persistence**: No database yet; Map-backed cache (`RedisCacheService`) simulates Redis. TTS URLs are deterministic hashes via `S3StorageService`.
- **External Integrations**: Google Generative AI (Gemini) for all AI prompts, stories-service gRPC client for chapter pulls

## Source Code Structure

```
src/
├── main.ts                 # Bootstraps HTTP + gRPC endpoints, validation pipe
├── app.module.ts           # Registers modules + configuration providers
├── config/
│   └── configuration.ts    # Maps AI_SERVICE_* env vars, cache, storage, stories gRPC URL
├── core/
│   ├── core.module.ts      # Global providers (GenerativeAIProvider, RedisCache, S3 helper)
│   └── generative-ai.provider.ts
├── cache/redis-cache.service.ts
├── storage/s3-storage.service.ts
├── clients/
│   ├── stories-client.module.ts
│   └── stories-client.service.ts     # gRPC bridge to stories-service (chapter fetch)
└── modules/
    ├── ai/                          # Gateway controller + ContentGenerationService
    ├── summarization/               # Chapter + annotation summaries via Gemini
    ├── translation/                 # Text/sentence/chapter translation + parallel view + 7-day cache
    ├── dictionary/                  # Lookup, touch translate, pronunciation (30-day cache)
    ├── tts/                         # Emotional/contextual narration & sync metadata
    └── recommendations/             # Placeholder collaborative/content pipelines + workers
```

## Module Highlights

- **Summarization**: `SummarizationService` and `AnnotationSummaryService` proxy prompts to Gemini and return `{ success, summary, insights }`. They short-circuit when the AI key is missing.
- **Translation**: `TranslationService` (text/sentence/chapter), `ParallelTranslationService`, and `TranslationCacheService` (7-day TTL via `RedisCacheService`).
- **Dictionary**: `DictionaryIntegrationService` (mocked dataset), `DictionaryService` (30-day cache), `PronunciationService` (synthetic phonetics).
- **TTS/Narration**: `TtsService` for deterministic URLs, `EmotionalTtsService`, `ContextualTtsService`, `TtsSyncService`, `HumanNarrationService`, `NarrationStrategyService`, and `TtsQueueWorker`.
- **Recommendations**: `CollaborativeFilteringService`, `ContentBasedFilteringService`, `RecommendationEngineService` (60/40 blend), analyzers (mood, natural language, filter-bubble, trending, user behavior) and placeholder workers.

## Exposed gRPC Methods (`ai.controller.ts`)

- **Summaries & Generation**: `Summarize`, `SummarizeAnnotations`, `GetAnnotationSummary`, `GenerateContent`
- **Translation**: `Translate`, `TranslateSentence`, `TranslateChapter`, `GetParallelTranslation`
- **Narration / TTS**: `SynthesizeSpeech`, `SynthesizeEmotionalSpeech`, `GetTTSWithSync`, `GetHumanNarration`, `GetNarrationOptions`
- **Dictionary**: `LookupWord`, `TouchTranslate`, `GetPronunciation`
- **Recommendations**: `GetRecommendations`, `GetMoodBasedRecommendations`, `SearchByNaturalLanguage`, `ExploreNewTerritories`, `GetSimilarStories`, `GetTrendingStories`, `ExplainRecommendation`

## Environment Variables

```env
AI_SERVICE_PORT=3005
AI_SERVICE_GRPC_URL=0.0.0.0:50055
AI_SERVICE_GOOGLE_API_KEY=your-google-api-key
AI_SERVICE_MODEL=gemini-pro
AI_SERVICE_MAX_TOKENS=1000
AI_SERVICE_CACHE_TTL_SECONDS=3600
AI_SERVICE_S3_BUCKET=ai-service-tts
AI_SERVICE_S3_PUBLIC_URL=https://cdn.local/ai
STORIES_SERVICE_GRPC_URL=0.0.0.0:50052
STORIES_SERVICE_RETRY_ATTEMPTS=3
STORIES_SERVICE_RETRY_DELAY_MS=250
STORIES_SERVICE_RETRY_BACKOFF=2
STORIES_SERVICE_RPC_TIMEOUT_MS=2000
```

- `AI_SERVICE_MAX_TOKENS` clamps any Gemini generation (summaries, translations, content/tts prompts) to keep responses predictable.
- `STORIES_SERVICE_*` variables harden the translation dependency: configurable gRPC URL plus retries, delay/backoff, and RPC timeout for the chapter-fetch client.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm start:dev

# Build
pnpm build

# Run production
pnpm start:prod
```

## Notes

- Requires `AI_SERVICE_GOOGLE_API_KEY` before any Gemini-powered feature works.
- Stateless service today; replace `RedisCacheService`/`S3StorageService` stubs with infra-backed providers per roadmap.
- All contracts/types come from `7-shared` (`ai.proto`, DTOs, and response models).
