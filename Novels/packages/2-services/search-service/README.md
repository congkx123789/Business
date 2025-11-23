# Search Service

Manages Search functionality using MeiliSearch. Listens to Event Bus for automatic indexing.

## Architecture

- **Database**: No direct database (uses MeiliSearch index)
- **Communication**: gRPC server (listens on port 50054 by default)
- **Event Bus**: Listens to `story.created`, `story.updated`, `story.deleted`, `post.created`, `post.deleted`
- **Technology**: MeiliSearch for full-text search

## Structure

```
search-service/
├── src/
│   ├── main.ts                 # Application entry point (REST health + gRPC)
│   ├── app.module.ts           # Root module wiring queues/workers
│   ├── config/
│   │   └── configuration.ts    # Configuration (HTTP/gRPC + MeiliSearch)
│   ├── common/
│   │   └── queue/              # Event Bus (BullMQ queues)
│   ├── controllers/
│   │   └── search.controller.ts # gRPC controller (stories + posts)
│   ├── modules/
│   │   └── search/
│   │       ├── dto/search-query.dto.ts
│   │       ├── search.module.ts
│   │       └── search.service.ts # MeiliSearch client + search operations
│   └── workers/
│       ├── story-indexer.worker.ts # Indexes story lifecycle events
│       └── post-indexer.worker.ts  # Indexes social posts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## gRPC Methods

- `SearchStories` - Search stories by query
- `SearchPosts` - Search social posts
- `IndexStory` - Manually index a story
- `UpdateStoryIndex` - Update story in index
- `DeleteStoryIndex` - Delete story from index
- `IndexPost` - Index social post content
- `DeletePostIndex` - Remove post from index

## Event Bus Workers

- **StoryIndexerWorker**: Listens to story events and automatically indexes/updates MeiliSearch stories index
- **PostIndexerWorker**: Listens to social events and keeps the posts index in sync

## Environment Variables

```env
SEARCH_SERVICE_PORT=3004
SEARCH_SERVICE_GRPC_URL=0.0.0.0:50054
SEARCH_SERVICE_MEILISEARCH_HOST=http://localhost:7700
SEARCH_SERVICE_MEILISEARCH_API_KEY=masterKey
SEARCH_SERVICE_REDIS_HOST=localhost
SEARCH_SERVICE_REDIS_PORT=6379
```

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

- This service does NOT connect to database (Rule #1)
- Automatically indexes stories when they are created/updated via Event Bus
- Uses MeiliSearch for fast, typo-tolerant search

