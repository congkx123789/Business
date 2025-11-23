# Community Service

Community Service powers the entire community & fan economy stack — from paragraph-level reactions to tipping loops and monthly votes.

## Ports
- **gRPC**: 3009 (internal)

## Modules
- **Interactions Module**
  - `micro/` – Paragraph comments (Duanping) with reactions and replies
  - `meso/` – Chapter-end comments with threading
  - `macro/` – Reviews & forums
  - `platform/` – Polls & quizzes
- **Fan Economy Module**
  - `tipping/` – Tips & revenue sharing
  - `rankings/` – Fan leaderboards
  - `gamification/` – Bonus votes & rewards
  - `votes/` – Monthly votes lifecycle
  - `author-fan/` – Q&A, updates, analytics

## Database
- PostgreSQL (service-owned) via Prisma ORM (`packages/2-services/community-service/prisma/schema.prisma`)
- Run `pnpm --filter community-service prisma:generate` after changing the schema.

