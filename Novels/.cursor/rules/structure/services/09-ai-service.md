---
alwaysApply: true
---

├── 📦 ai-service/                  # 🤖 AI SERVICE
    │   │
    │   ├── 📋 Service Snapshot
    │   │   ├── **Purpose:** AI-assisted helpers for reading (summaries, translation, dictionary, narration, lightweight recommendations)
    │   │   ├── **Port:** 3005 (gRPC server, exposed via `ai.controller.ts`)
    │   │   ├── **Key Tech:** NestJS microservice, `@google/generative-ai` (Gemini), in-memory Redis shim, deterministic S3 URL helper
    │   │   ├── **External Integrations (today):** Google Generative AI for text tasks + stories-service gRPC (chapter fetch)
    │   │   └── **Persistence:** No database yet; caching relies on `RedisCacheService` (Map-backed) and S3 URLs are synthesized rather than uploaded
    │   │
    │   ├── 📁 Layout (`packages/2-services/ai-service/src`)
    │   │   ├── main.ts / app.module.ts
    │   │   ├── core/
    │   │   │   ├── core.module.ts                # Registers Config, AI provider, cache, storage
    │   │   │   └── generative-ai.provider.ts     # Wraps GoogleGenerativeAI and guards against missing API keys
    │   │   ├── config/configuration.ts           # Maps `AI_SERVICE_*`, cache, storage, and stories gRPC env vars
    │   │   ├── cache/redis-cache.service.ts      # Simple Map + TTL cache (used everywhere in lieu of real Redis)
    │   │   ├── storage/s3-storage.service.ts     # Hash-based object-key + presigned URL builder (no AWS SDK wiring yet)
    │   │   ├── clients/stories-client.*          # gRPC client used by translation module to pull chapter content
    │   │   └── modules/
    │   │       ├── ai/                           # `AIController` (all gRPC endpoints) + `ContentGenerationService`
    │   │       ├── summarization/                # Text + annotation summaries via Gemini
    │   │       ├── translation/                  # Sentence/chapter translation, parallel views, 7-day cache wrapper
    │   │       ├── dictionary/                   # Lookup/touch translate/pronunciation using mocked providers + 30-day cache
    │   │       ├── tts/                          # Emotional/contextual narration strategy, sync metadata, human catalogue stub
    │   │       └── recommendations/              # Placeholder recommendation pipeline + 1-hour cache + worker stubs
    │   │
    │   ├── ⚙️ Configuration Highlights (`src/config/configuration.ts`)
    │   │   ├── `AI_SERVICE_GOOGLE_API_KEY` / `AI_SERVICE_MODEL` – required before any Gemini prompt can run
    │   │   ├── `AI_SERVICE_PORT` / `AI_SERVICE_GRPC_URL` – NestJS microservice listener configuration
    │   │   ├── `AI_SERVICE_CACHE_TTL_SECONDS` – default TTL for the Map-backed cache (modules override per business rule)
    │   │   ├── `AI_SERVICE_S3_*` – bucket/prefix/public URL used to mint deterministic TTS URLs (actual uploads still TODO)
    │   │   └── `STORIES_SERVICE_*` – gRPC endpoint plus retry attempts, delay/backoff, and RPC timeout knobs that harden the chapter-fetch client used by translation flows
    │   │
    │   ├── 🧩 Module Notes
    │   │   ├── **Summarization** – `SummarizationService` and `AnnotationSummaryService` proxy prompts to Gemini and return structured `{ success, summary, insights }` payloads. They short-circuit with `AI model is not configured` when the API key is missing.
    │   │   ├── **Translation** – `TranslationService` uses the same AI provider for text/sentence/chapter translation and caches outputs for 7 days via `translation-cache.service.ts`. `ParallelTranslationService` formats original + translated lines according to `displayMode`.
    │   │   ├── **Dictionary** – `DictionaryIntegrationService` is currently an in-memory dictionary (entries such as `cultivate`, `qi`). `DictionaryService` memoizes lookups for 30 days, and `PronunciationService` synthesizes deterministic phonetics.
    │   │   ├── **TTS / Narration** – `TtsService` returns hashed URLs from the fake S3 helper, `EmotionalTtsService` adds metadata, `ContextualTtsService` auto-selects emotion based on context, `TtsSyncService` fabricates sync points, `HumanNarrationService` stores a demo catalogue, and `NarrationStrategyService` is the public façade. `TtsQueueWorker` only logs jobs for now.
    │   │   ├── **Recommendations** – Everything is placeholder logic: collaborative/content services fabricate deterministic scores, `RecommendationEngineService` blends them (60/40). `RecommendationsService` caches `GetRecommendations` responses for 1 hour via `RedisCacheService.wrap`. Mood/NL search/filter-bubble/trending analyzers also emit mock data, and workers (`recommendation-calculation.worker.ts`, `behavior-event-processor.worker.ts`) merely log.
    │   │   └── **Core & Clients** – `GenerativeAIProvider` is the single integration point for Gemini; it logs a warning if the key is absent. `StoriesClientService` hides the chapter-fetch gRPC calls with configurable retries/backoff/timeouts; translation is the only consumer today.
    │   │
    │   ├── 🛰️ Exposed gRPC Methods (`ai.controller.ts`)
    │   │   - Summaries & generation: `Summarize`, `SummarizeAnnotations`, `GetAnnotationSummary`, `GenerateContent`
    │   │   - Translation: `Translate`, `TranslateSentence`, `TranslateChapter`, `GetParallelTranslation`
    │   │   - Narration / TTS: `SynthesizeSpeech`, `SynthesizeEmotionalSpeech`, `GetTTSWithSync`, `GetHumanNarration`, `GetNarrationOptions`
    │   │   - Dictionary: `LookupWord`, `TouchTranslate`, `GetPronunciation`
    │   │   - Recommendations: `GetRecommendations`, `GetMoodBasedRecommendations`, `SearchByNaturalLanguage`, `ExploreNewTerritories`, `GetSimilarStories`, `GetTrendingStories`, `ExplainRecommendation`
    │   │
    │   ├── 🚧 Known Gaps
    │   │   1. Replace `RedisCacheService` with real Redis/BullMQ infrastructure (Rule #7).
    │   │   2. Wire `TtsService` to actual TTS engines (Google/Azure/Polly) and upload audio to S3 instead of returning hashed URLs.
    │   │   3. Feed recommendation services with real behavior + story metadata instead of deterministic mocks; connect workers to the event bus.
    │   │   4. Swap the dictionary integration for ABBYY/Oxford or other licensed APIs.
    │   │
    │   └── 🧪 Local Tips
    │       - Provide `AI_SERVICE_GOOGLE_API_KEY` before calling any summarization/translation/content-generation RPC.
    │       - Map-backed caches reset on every restart—handy while iterating, but do not rely on them for persistence.
    │       - Use `pnpm --filter ai-service start:dev` to boot the service (GRPC listens on `AI_SERVICE_GRPC_URL`, HTTP logger on `AI_SERVICE_PORT`).

---

**See also:** [Services Overview](./04-2-services-overview.md) | [Main README](./README.md) | [Architecture Overview](../overview/01-overview.md)
