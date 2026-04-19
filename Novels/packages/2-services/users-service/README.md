# Users Service

Handles identity, authentication, reading preferences, desktop preferences, the reader’s entire library, bookmarks, annotations, gamification rewards, and all synchronization flows that keep data consistent across devices.

## Architecture

- **Framework**: NestJS microservice (HTTP + gRPC)
- **Ports**: HTTP `3002`, gRPC `0.0.0.0:50051`
- **Storage**: Dedicated PostgreSQL database accessed through Prisma (Rule #1)
- **Contracts**: Imports DTOs/proto definitions from `7-shared`
- **Authentication**: JWT (access + refresh tokens) issued by `auth` module
- **Sync**: Library, progress, bookmarks, annotations, and desktop preferences all have dedicated services responsible for last-write-wins synchronization and conflict handling.

## Folder Layout

```
users-service/
├── prisma/
│   └── schema.prisma                  # User, Library, Gamification, Annotation models
├── src/
│   ├── main.ts                        # Bootstraps HTTP + gRPC servers
│   ├── app.module.ts                  # Wires config + feature modules
│   ├── config/configuration.ts        # app/database/JWT configuration factories
│   ├── common/database/               # Prisma module/service
│   └── modules/
│       ├── auth/                      # JWT issuing + validation
│       ├── users/                     # gRPC controller + core CRUD service
│       ├── reading-preferences/       # Reader preference CRUD + sync helpers
│       ├── desktop-preferences/       # Tab state, layout presets, keyboard shortcuts
│       ├── library/                   # Library CRUD + sync/download/storage services
│       ├── bookshelf/                 # Virtual shelves + organization helpers
│       ├── library-auto-organization/ # Auto lists, author/series grouping
│       ├── library-advanced-organization/ # Tags + filtered views
│       ├── wishlist/                  # Wishlist management
│       ├── reading-progress/          # Progress tracking + sync
│       ├── bookmarks/                 # Bookmark CRUD
│       ├── annotations/               # Annotation suite (AI, export, revisitation, sync)
│       ├── user-behavior/             # Behavior tracking + event emission
│       └── gamification/              # Daily missions, rewards, power stones
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Key Modules

- **Auth** – Issues/validates JWT tokens and exposes guard/strategy glue for downstream controllers.
- **Users** – Implements all `users.proto` RPCs (get/create/update/delete user + library/bookmark/annotation endpoints) and orchestrates between feature services.
- **Reading Preferences** – Stores classic reader settings (font, colors, reading mode) and ensures DTOs come from `7-shared`.
- **Desktop Preferences** – Persists desktop-only state (open tabs, layouts, focus mode, keyboard shortcuts) through `tab-state.service.ts` and `layout-preferences.service.ts`.
- **Library** – Rich management layer with `library.service.ts` for CRUD, `library-sync.service.ts` for conflict-free sync, `library-download.service.ts` for offline downloads, and `library-storage.service.ts` for quota tracking.
- **Bookshelf / Library Organization** – Manual (`bookshelf-organization.service.ts`) plus automated (`library-auto-organization.service.ts`, `system-lists.service.ts`) curation, along with advanced tagging (`tags.service.ts`) and filtered views.
- **Wishlist** – Tracks stories the reader plans to read/buy later.
- **Reading Progress** – `reading-progress.service.ts` + `reading-progress-sync.service.ts` keep chapter position in sync across all clients.
- **Bookmarks** – CRUD around chapter bookmarks with optional notes.
- **Annotations Suite** – Multiple specialized services:
  - `annotation-unification.service.ts` (merge highlights from multiple sources)
  - `annotation-export.service.ts` (Notion/Obsidian/Markdown export)
  - `annotation-revisitation.service.ts` (spaced repetition queue)
  - `annotation-ai-summary.service.ts` (delegates to `ai-service`)
  - `annotation-sync.service.ts` (two-way sync with clients)
- **User Behavior** – Captures granular activity (`track-click`, `track-reading-time`, etc.) and emits events for recommendation pipelines.
- **Gamification** – `daily-missions.service.ts`, `rewards.service.ts`, and `power-stones.service.ts` implement the full F2P retention loop (check-ins, reading missions, ad rewards, Fast Pass handling).

## Cross-Device Synchronization

- **Library & Organization**: `library-sync.service.ts`, `library-auto-organization.service.ts`, and `library-advanced-organization` ensure tags, shelves, lists, and filters stay consistent.
- **Reading Progress & Bookmarks**: Dedicated sync services keep chapter progress and bookmarks in lockstep across devices with last-write-wins semantics.
- **Annotations**: `annotation-sync.service.ts` plus the revisitation/export flows guarantee highlights are never lost (critical retention requirement).
- **Desktop Preferences**: Tab state, splits, layouts, keyboard shortcuts, and focus options are synchronized via the desktop preferences module so power users can hop between desktop sessions seamlessly.

## gRPC Surface (users.proto)

| Method | Description |
| --- | --- |
| `GetUserById` | Fetch a user profile by numeric ID. |
| `GetUserByEmail` | Resolve user identity by email. |
| `CreateUser` / `UpdateUser` / `DeleteUser` | Core account CRUD. |
| `GetUserLibrary` / `GetLibrary` / `UpdateLibraryItem` / `SyncLibrary` | Library retrieval + two-way sync. |
| `AddToLibrary` / `RemoveFromLibrary` | Legacy helpers for quick add/remove. |
| `GetBookshelves` / `CreateBookshelf` / `UpdateBookshelf` / `DeleteBookshelf` | Bookshelf CRUD. |
| `AddToBookshelf` / `RemoveFromBookshelf` / `ReorderBookshelf` | Shelf organization flows. |
| `GetWishlist` / `AddToWishlist` / `RemoveFromWishlist` / `MoveToLibrary` | Wishlist lifecycle. |
| `GetReadingPreferences` / `UpdateReadingPreferences` | Reader preference management. |
| `GetBookmarks` / `CreateBookmark` / `DeleteBookmark` / `SyncBookmarks` | Bookmark CRUD + sync. |
| `GetAnnotations` / `CreateAnnotation` / `UpdateAnnotation` / `DeleteAnnotation` / `SyncAnnotations` | Annotation suite (AI + export + revisitation). |
| `GenerateAnnotationSummary` / `ExportAnnotations` / `UnifyAnnotations` | AI summary + export/import utilities. |
| `GetReadingProgress` / `UpdateReadingProgress` / `SyncReadingProgress` / `MarkStoryCompleted` | Reading progress orchestration. |
| `CreateTag` / `UpdateTag` / `DeleteTag` / `GetTags` | Tag management APIs. |
| `ApplyTagToLibrary` / `RemoveTagFromLibrary` | Library↔Tag association helpers. |
| `CreateFilteredView` / `UpdateFilteredView` / `DeleteFilteredView` / `GetFilteredViews` / `ExecuteFilter` | Saved filters + dynamic queries. |
| `GetSystemLists` / `UpdateSystemList` | System list maintenance (Favorites, To Read, etc.). |
| `DownloadStory` / `BatchDownload` / `GetDownloadQueue` / `GetStorageUsage` | Offline download + quota tracking. |
| `GetPendingSyncQueue` / `ProcessSyncQueue` | Offline-first sync queue helpers. |
| `UpdateTabState` / `UpdateLayoutPreferences` / `UpdateFocusMode` / `UpdateKeyboardShortcuts` | Desktop preference sync. |

> The users-service controller now mirrors the complete `users.proto` surface so clients can lean on this service for every reader-facing capability outlined in the structure documentation (library, organization, sync, downloads, annotations, and desktop power features).

## Environment Variables

```env
USERS_SERVICE_PORT=3002
USERS_SERVICE_GRPC_URL=0.0.0.0:50051

# Primary connection string (recommended)
USERS_SERVICE_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/users_service?schema=public

# Optional granular overrides (used when DATABASE_URL is omitted)
USERS_SERVICE_DATABASE_USER=postgres
USERS_SERVICE_DATABASE_PASSWORD=postgres
USERS_SERVICE_DATABASE_HOST=localhost
USERS_SERVICE_DATABASE_PORT=5433
USERS_SERVICE_DATABASE_NAME=users_service
USERS_SERVICE_DATABASE_SCHEMA=public

USERS_SERVICE_JWT_SECRET=change-me
USERS_SERVICE_JWT_ACCESS_TTL=15m
USERS_SERVICE_JWT_REFRESH_TTL=7d
```

## Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client (after editing schema.prisma)
npx prisma generate

# Run in development mode (HTTP + gRPC)
pnpm start:dev

# Build / run production bundle
pnpm build
pnpm start:prod
```

## Notes

- Users Service is the system of record for user profile data, library metadata, bookmarks, annotations, and F2P gamification. No other service can access this database directly (Rule #1).
- All DTOs/types originate from `7-shared`, keeping contracts uniform across gateway and clients (Rule #3).
- Cross-device sync and annotation durability are treated as critical reliability features—loss of data is considered a Sev0 incident.

