---
alwaysApply: true
---

├── 📦 search-service/              # 🔍 SEARCH SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Full-text search for Stories and Posts
    │   │   │   ├── **Search Engine:** MeiliSearch (no database needed)
    │   │   │   ├── **Port:** 3004 (gRPC server)
│   │   │   ├── **Events:** Listens to story.created, story.updated, post.created
│   │   │   └── **gRPC Contract:** SearchStories, SearchPosts, IndexStory, UpdateStoryIndex, DeleteStoryIndex, IndexPost, DeletePostIndex
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts
    │   │   │       ├── app.module.ts
    │   │   │       │
    │   │   │       ├── 📁 modules/
    │   │   │       │   └── 📁 search/                   # Search Module
    │   │   │       │       ├── search.module.ts
    │   │   │       │       ├── search.service.ts       # MeiliSearch client wrapper
    │   │   │       │       └── dto/
    │   │   │       │           └── search-query.dto.ts
    │   │   │       │
    │   │   │       ├── 📁 controllers/
    │   │   │       │   └── search.controller.ts       # gRPC controller
    │   │   │       │
    │   │   │       └── 📁 workers/                      # Event Bus Workers
    │   │   │           ├── story-indexer.worker.ts     # Indexes stories on story.created/updated
    │   │   │           └── post-indexer.worker.ts      # Indexes posts on post.created
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   └── README.md
    │   │   │
    │   │   └── 📁 MeiliSearch Indexes
    │   │       ├── stories index                        # Story search index
    │   │       └── posts index                          # Post search index
    │   │
    │   📝 **Development Steps:**
    │   │   │       1.  Setup NestJS (No Prisma needed). Install `meilisearch` client.
    │   │   │       2.  Create a "Worker" (using `@nestjs/bull` 's `@Process()`) that listens to events: `story.created`, `story.updated`, AND `post.created` (new event from social-service).
    │   │   │       3.  On `story.created`/`story.updated`, call `meili.index('stories').addDocuments(...)` to index.
    │   │   │       4.  On `post.created`, call `meili.index('posts').addDocuments(...)` to index posts for search.
    │   │   │       5.  Update `search.proto` (in 7-shared) to support searching in both 'stories' and 'posts' indexes.
    │   │   │       6.  Define `search.proto` (gRPC) in `7-shared/src/proto/` and implement it here.
    │   │
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
