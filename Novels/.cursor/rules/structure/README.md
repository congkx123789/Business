---
alwaysApply: true
---

# 📚 Monorepo Project Structure Documentation

## 🎯 Overview

Tài liệu này cung cấp cấu trúc chi tiết và đầy đủ của hệ thống microservice reading app, được tổ chức thành nhiều folder và file nhỏ để dễ đọc và tra cứu. Structure được thiết kế để hỗ trợ triển khai theo lộ trình chiến lược 3 giai đoạn (MVP → Moat → Optimization).

## 📖 Cách sử dụng

1. **Bắt đầu từ đây**: Đọc file này để hiểu tổng quan về cấu trúc
2. **🗺️ Implementation Roadmap**: Xem [roadmap/README.md](./roadmap/README.md) - **Lộ trình triển khai 3 giai đoạn (MVP → Moat → Optimization)**
3. **Hướng dẫn chi tiết**: Xem [overview/HOW_TO_USE.md](./overview/HOW_TO_USE.md) để biết cách tìm kiếm và sử dụng tài liệu
4. **Quick Reference**: Xem [overview/01-overview.md](./overview/01-overview.md) để có cái nhìn nhanh về architecture
5. **Chi tiết từng phần**: Đi vào các folder tương ứng với service/package bạn đang làm việc
6. **⌨️ Keyboard Shortcuts**: Xem [clients/keyboard-shortcuts.md](./clients/keyboard-shortcuts.md) cho thiết kế phím tắt đầy đủ

## 📁 Cấu trúc tài liệu

Tài liệu được tổ chức thành các folder theo chức năng:

### 📋 [overview/](./overview/README.md) - Tổng quan
Chứa các tài liệu tổng quan về cấu trúc hệ thống:
- **[01-overview.md](./overview/01-overview.md)** - Quick Reference Guide, Architecture Overview, Package Quick Reference
- **[HOW_TO_USE.md](./overview/HOW_TO_USE.md)** - Hướng dẫn chi tiết cách tìm kiếm và sử dụng tài liệu

### 🗺️ [roadmap/](./roadmap/README.md) - Implementation Roadmap ⭐ **NEW**
Lộ trình triển khai chiến lược 3 giai đoạn:
- **[README.md](./roadmap/README.md)** - Roadmap Overview
- **[PHASE_1_MVP.md](./roadmap/PHASE_1_MVP.md)** - Phase 1: Minimum Viable Product
- **[PHASE_2_MOAT.md](./roadmap/PHASE_2_MOAT.md)** - Phase 2: Competitive Moat
- **[PHASE_3_OPTIMIZATION.md](./roadmap/PHASE_3_OPTIMIZATION.md)** - Phase 3: Long-term Optimization
- **[ECOSYSTEM_FLYWHEEL.md](./roadmap/ECOSYSTEM_FLYWHEEL.md)** - Ecosystem Flywheel Analysis
- **[IMPLEMENTATION_CHECKLIST.md](./roadmap/IMPLEMENTATION_CHECKLIST.md)** - Implementation Checklist

### 🏗️ [root/](./root/README.md) - Root Structure
Chứa tài liệu về cấu trúc root của monorepo:
- **[02-root-structure.md](./root/02-root-structure.md)** - Root Configuration Files, Documentation & Scripts

### 🌐 [gateway/](./gateway/README.md) - API Gateway
Chứa tài liệu về API Gateway (BFF Layer):
- **[03-1-gateway.md](./gateway/03-1-gateway.md)** - API Gateway chi tiết (REST, GraphQL, WebSocket)

### 🔧 [services/](./services/README.md) - Microservices
Chứa tài liệu về tất cả các microservices:
- **[04-2-services-overview.md](./services/04-2-services-overview.md)** - Tổng quan về tất cả microservices
- **[05-users-service.md](./services/05-users-service.md)** - Users Service (User management, Library, Reading Preferences, Bookmarks, Annotations, Bookshelf)
- **[06-stories-service.md](./services/06-stories-service.md)** - Stories Service (Content management)
- **[07-comments-service.md](./services/07-comments-service.md)** - Comments Service (Comments & Ratings)
- **[08-search-service.md](./services/08-search-service.md)** - Search Service (Full-text search)
- **[09-ai-service.md](./services/09-ai-service.md)** - AI Service (TTS, Translation, Dictionary, Summarization, Recommendations)
- **[10-notification-service.md](./services/10-notification-service.md)** - Notification Service (Email, Push, SMS)
- **[11-websocket-service.md](./services/11-websocket-service.md)** - WebSocket Service (Real-time communication)
- **[12-social-service.md](./services/12-social-service.md)** - Social Service (Posts, Groups, Follows, Feeds)
- **[13-community-service.md](./services/13-community-service.md)** - Community Service (Community Interactions & Fan Economy)
- **[14-monetization-service.md](./services/14-monetization-service.md)** - Monetization Service (PPC, Virtual Currency, Subscriptions)

### 💻 [clients/](./clients/README.md) - Client Applications
Chứa tài liệu về các client applications:
- **[README.md](./clients/README.md)** - Client Applications Overview & Navigation
- **[13-3-web.md](./clients/13-3-web.md)** - Next.js Web Frontend (Desktop Web App - PWA) - Power-User Optimized with Multi-Window/Tabs, Split-View, Advanced Search, Bulk Operations - Includes Core Reader Interface (Based on Qidian/QQ Reading)
- **[keyboard-shortcuts.md](./clients/keyboard-shortcuts.md)** - Keyboard Shortcuts Design Specification (Power-user feature)
- **[14-4-desktop.md](./clients/14-4-desktop.md)** - Electron Desktop App
- **[15-5-mobile-ios.md](./clients/15-5-mobile-ios.md)** - iOS Native App (SwiftUI) - Includes Core Reader Interface (Based on Qidian/QQ Reading)
- **[16-6-mobile-android.md](./clients/16-6-mobile-android.md)** - Android Native App (Jetpack Compose) - Includes Core Reader Interface (Based on Qidian/QQ Reading)

### 📦 [shared/](./shared/README.md) - Shared Library
Chứa tài liệu về Shared Library:
- **[17-7-shared.md](./shared/17-7-shared.md)** - Shared Library (Types, DTOs, Proto files, Constants)

## 🔍 Tìm kiếm nhanh

### Theo chức năng:
- **Authentication & Authorization**: 
  - [Gateway Auth](./gateway/03-1-gateway.md) (Auth Module)
  - [Users Service Auth](./services/05-users-service.md) (Auth Service)
- **Reading Features**: 
  - **Reader Interface (Core Reading Experience - Enhanced with Market Analysis Features)** ⭐ **NEW**
    - [Reader Features Enhancement](./overview/READER_FEATURES_ENHANCEMENT.md) - Comprehensive market analysis features integration
    - [Web Reader](./clients/13-3-web.md#reader-interface-core-reading-experience) - Complete guide with UI customization, content interaction, library management
    - [Mobile iOS Reader](./clients/15-5-mobile-ios.md#reader-interface-core-reading-experience) | [Android Reader](./clients/16-6-mobile-android.md#reader-interface-core-reading-experience)
    - **New Features:**
      - Custom Font Upload (OTF/TTF) - Delighter feature for power users and accessibility
      - Blue Light Filtering (Adaptive Eye Protection) - Health & wellness feature
      - Enhanced Navigation (Scroll vs Page Turn - both options available)
      - Multi-Format Support (EPUB, PDF, DOCX, etc.) with smart processing
  - **Annotation & Research Tools (Annotation Suite & Learning Tools)** ⭐ **NEW**
    - [Users Service Annotations](./services/05-users-service.md) - Enhanced annotation module with AI summaries, workflow integration, unification, revisitation
    - [AI Service Learning Tools](./services/09-ai-service.md) - Dictionary, translation, and language learning features
    - **Annotation Suite Features:**
      - AI Summary: Generate summaries from highlighted text only
      - Workflow Integration: Export to Notion, Obsidian, Capacities (Markdown)
      - Unification: Collect annotations from all sources (EPUB, PDF, web, YouTube, Twitter)
      - Revisitation: Spaced repetition, review highlights
    - **Learning Tools Features:**
      - Dictionary: Pop-up dictionary with pronunciation, pinyin, examples
      - Translation: Sentence-level and parallel translation (language learning optimized)
      - Touch-to-Translate: Instant translation on tap/click
      - Third-party Integration: Support for ABBYY and other high-quality dictionaries
  - **Offline-First Architecture (MVP Phase 1)** ⭐ **NEW**
    - [Phase 1 MVP - Offline-First Architecture](./roadmap/PHASE_1_MVP.md#5-offline-first-architecture-mobile-foundation) - Comprehensive implementation guide
    - [iOS Offline Architecture](./clients/15-5-mobile-ios.md) - Metadata Database (Core Data), Content Storage, Encryption, Sync
    - [Android Offline Architecture](./clients/16-6-mobile-android.md) - Metadata Database (Room), Content Storage, Encryption, Sync
    - [Backend Sync Service](./services/05-users-service.md) - Enhanced sync with conflict resolution
    - **Offline-First Features:**
      - Metadata Database: SQLite (Core Data/Room) for metadata only (NO BLOBs)
      - Content Storage: App-Specific Storage for chapter files (separated from metadata)
      - Data-at-Rest Encryption: AES-256 encryption for chapter files (DRM Layer 2)
      - Enhanced Sync Service: Conflict resolution (last-write-wins), sync queue, offline support
  - **Desktop Web App (Power-User Features)**:
    - [Desktop Features](./clients/13-3-web.md#desktop-specific-features-power-user-optimized) - Multi-window/tabs, split-view reading, focus mode, advanced search, bulk operations, export/import
  - [Keyboard Shortcuts](./clients/keyboard-shortcuts.md) (Power-user keyboard navigation)
  - [Reading Preferences](./services/05-users-service.md) (Reading Preferences Module)
  - [Bookmarks & Annotations](./services/05-users-service.md) (Bookmarks & Annotations Modules)
- **Discovery & Engagement (Storefront & Curation)**: 
  - [Storefront & Curation](./services/06-stories-service.md#discovery--engagement-features) (Genre Browsing, Ranking Charts, Editor's Picks, Search integration)
  - [Storefront UI](./clients/13-3-web.md) (Storefront Components, Browse Pages, Genre Navigation, Ranking Charts)
  - [Search Service](./services/08-search-service.md) (Full-text search)
  - **Hybrid Discovery Model:** Pull (user-driven search/browse), Push (platform-driven editor picks), Social Proof (ranking charts)
- **Library Management**: 
  - **Library & Content Management (Enhanced with Market Analysis Features)** ⭐ **NEW**
    - [Library Management Enhancement](./overview/LIBRARY_MANAGEMENT_ENHANCEMENT.md) - Comprehensive market analysis features integration
    - [Library Service](./services/05-users-service.md) (Library, Bookshelf, Wishlist, Reading Progress, Tags, Filtered Views, System Lists)
    - [Library UI](./clients/13-3-web.md) (Library Feature Components)
    - **New Features:**
      - Auto-Organization (by Author, Series) - System-generated organization
      - System Lists (Favorites, To Read, Have Read, Currently Reading, Recently Added) - Predefined lists
      - Tags System (Hierarchical, Flexible Categorization) - Power user feature
      - Filtered Views (Dynamic Queries) - Knowledge management feature
      - Enhanced Offline Download Management (Cloud-first model with storage management)
      - Enhanced Cross-Device Sync (Critical for retention - bookmarks, highlights, notes)
- **Community Interactions**: 
  - [Comments Service](./services/07-comments-service.md) (Hierarchical System: Micro/Meso/Macro)
  - [Community UI](./clients/13-3-web.md) (Paragraph Comments, Chapter Comments, Reviews, Forums, Polls, Quizzes)
- **Social Features**: 
  - [Social Service](./services/12-social-service.md)
  - [Social UI](./clients/13-3-web.md) (Social Feature Components)
- **AI Features**: 
  - [AI Service](./services/09-ai-service.md) (TTS, Translation, Dictionary, Recommendation Engine)
  - [AI Integration](./clients/13-3-web.md) (TTS Player, Dictionary Popup, Recommendations)
  - [Recommendation Engine (Retention Engine)](./services/09-ai-service.md#recommendation-engine-retention-engine---long-term) (Collaborative Filtering, Content-Based Filtering, Hybrid Model)
  - **Data Collection:** Comprehensive user behavior tracking (clicks, reading time, purchases, browsing) via Event Bus
  - **Big Data Processing:** ML model training, A/B testing, real-time recommendation updates
- **Real-time Communication**: 
  - [WebSocket Service](./services/11-websocket-service.md)
  - [WebSocket Integration](./clients/13-3-web.md) (WebSocket connection)

### Theo công nghệ:
- **NestJS Services**: 
  - [Gateway](./gateway/README.md)
  - [Services](./services/README.md) và các file service cụ thể
- **Next.js Frontend**: 
  - [Web Frontend](./clients/13-3-web.md)
- **Mobile Apps**: 
  - [iOS](./clients/15-5-mobile-ios.md)
  - [Android](./clients/16-6-mobile-android.md)
- **gRPC & Contracts**: 
  - [Proto files](./shared/17-7-shared.md) (Proto definitions)
  - gRPC Implementation: Xem các service files
- **Database**: 
  - Prisma Schemas: Xem các service files (mỗi service có schema riêng)
  - Core Data (iOS): [iOS App](./clients/15-5-mobile-ios.md)
  - Room (Android): [Android App](./clients/16-6-mobile-android.md)

## ⭐ Prominent Features (Strategic Impact)

These five features are the core differentiators that drive Revenue, Engagement, and Technological Advantage:

1. **🎯 Privilege Model (Monetization)**
   - **Strategic Impact**: Revenue Segmentation, Dual Monetization, Whale Targeting
   - **Service**: [Monetization Service](./services/14-monetization-service.md) (Port 3010)
   - **Details**: [Overview - Privilege Model](./overview/01-overview.md#privilege-model-monetization)
   - **Gateway**: [Privilege Endpoints](./gateway/03-1-gateway.md#monetization-module)
   - **Clients**: [Web](./clients/13-3-web.md) | [iOS](./clients/15-5-mobile-ios.md) | [Android](./clients/16-6-mobile-android.md)

2. **💰 Pay-Per-Chapter (PPC) Model (Monetization)**
   - **Strategic Impact**: Core Revenue Engine, Psychological Pricing, Serial Content Optimization
   - **Service**: [Monetization Service](./services/14-monetization-service.md) (Port 3010)
   - **Details**: [Overview - PPC Model](./overview/01-overview.md#pay-per-chapter-ppc-model-monetization)
   - **Gateway**: [PPC Endpoints](./gateway/03-1-gateway.md#monetization-module)
   - **Clients**: [Web](./clients/13-3-web.md) | [iOS](./clients/15-5-mobile-ios.md) | [Android](./clients/16-6-mobile-android.md)

3. **💬 Paragraph-Level Comments (Community)**
   - **Strategic Impact**: Engagement Multiplier, Social Reading, Author Feedback Loop
   - **Service**: [Community Service](./services/13-community-service.md) (Port 3009)
   - **Details**: [Overview - Paragraph Comments](./overview/01-overview.md#paragraph-level-comments-community)
   - **Gateway**: [Paragraph Comments Endpoints](./gateway/03-1-gateway.md#community-module)
   - **Clients**: [Web](./clients/13-3-web.md) | [iOS](./clients/15-5-mobile-ios.md) | [Android](./clients/16-6-mobile-android.md)

4. **🎮 Gamified Missions (F2P Retention)**
   - **Strategic Impact**: Free User Retention, Habit Formation, Indirect Monetization (Ads)
   - **Service**: [Users Service](./services/05-users-service.md) (Port 3001)
   - **Details**: [Overview - Gamified Missions](./overview/01-overview.md#gamified-missions-f2p-retention)
   - **Gateway**: [Gamification Endpoints](./gateway/03-1-gateway.md#users-module)
   - **Clients**: [Web](./clients/13-3-web.md) | [iOS](./clients/15-5-mobile-ios.md) | [Android](./clients/16-6-mobile-android.md)

5. **🎙️ AI Narration (Technology)**
   - **Strategic Impact**: Content Multiplier, Cost Disruption, Multi-Modal Consumption
   - **Service**: [AI Service](./services/09-ai-service.md) (Port 3005)
   - **Details**: [Overview - AI Narration](./overview/01-overview.md#ai-narration-technology)
   - **Gateway**: [TTS Endpoints](./gateway/03-1-gateway.md#tts--language-tools-module)
   - **Clients**: [Web](./clients/13-3-web.md) | [iOS](./clients/15-5-mobile-ios.md) | [Android](./clients/16-6-mobile-android.md)

**Integration & Synergy**: See [Overview - Integration & Synergy](./overview/01-overview.md#integration--synergy-between-prominent-features) for how these features work together to create revenue flywheels, engagement loops, and technological advantages.

## 📝 Lưu ý quan trọng

### Coding Rules
1. **Rule #1**: Services NEVER touch each other's databases
2. **Rule #3**: ALL contracts defined in 7-shared first
3. **Rule #4**: Gateway is a "Bouncer", NOT the "Brain" - NO business logic!
4. **Rule #5**: Use React Query for server data, Zustand for UI state only (Web frontend)

### Documentation Rules
⚠️ **QUY TẮC VÀNG:** Khi bạn thay đổi code, bạn **PHẢI** cập nhật structure documentation tương ứng.

Xem **[STRUCTURE_MAINTENANCE.md](./STRUCTURE_MAINTENANCE.md)** để biết chi tiết về:
- Checklist khi nào cần cập nhật
- Workflow cập nhật structure documentation
- Examples và best practices

## 🔄 Cập nhật tài liệu

**⚠️ QUAN TRỌNG:** Khi thay đổi code, bạn **PHẢI** cập nhật structure documentation tương ứng.

Xem **[STRUCTURE_MAINTENANCE.md](./STRUCTURE_MAINTENANCE.md)** để biết:
- Checklist khi nào cần cập nhật
- Workflow cập nhật structure documentation
- Examples các trường hợp cụ thể
- Best practices

### Quick Checklist

Khi thêm tính năng mới hoặc thay đổi cấu trúc:
1. ✅ Cập nhật file tương ứng trong folder service/package
2. ✅ Cập nhật [overview/01-overview.md](./overview/01-overview.md) nếu có thay đổi về architecture
3. ✅ Cập nhật README.md trong folder tương ứng
4. ✅ Cập nhật file này nếu có thay đổi về cấu trúc tài liệu
5. ✅ Cập nhật [overview/HOW_TO_USE.md](./overview/HOW_TO_USE.md) nếu có file mới

**Xem chi tiết:** [STRUCTURE_MAINTENANCE.md](./STRUCTURE_MAINTENANCE.md)

## 📂 Cấu trúc folder

```
structure/
├── README.md (file này)               # Main documentation entry point
├── STRUCTURE_MAINTENANCE.md            # ⚠️ QUY TẮC BẮT BUỘC: Cập nhật structure docs
│
├── roadmap/                            # 🗺️ Implementation Roadmap
│   ├── README.md                       # Roadmap Overview
│   ├── PHASE_1_MVP.md                  # Phase 1: MVP
│   ├── PHASE_2_MOAT.md                 # Phase 2: The Moat
│   ├── PHASE_3_OPTIMIZATION.md         # Phase 3: Optimization
│   ├── ECOSYSTEM_FLYWHEEL.md           # Ecosystem Flywheel Analysis
│   └── IMPLEMENTATION_CHECKLIST.md     # Implementation Checklist
│
├── overview/                           # 📋 Tổng quan
│   ├── README.md
│   ├── 01-overview.md                  # Architecture overview
│   └── HOW_TO_USE.md                   # Usage guide
│
├── root/                               # 🏗️ Root Structure
│   ├── README.md
│   └── 02-root-structure.md            # Root configuration files
│
├── gateway/                            # 🌐 API Gateway
│   ├── README.md
│   └── 03-1-gateway.md                 # Gateway details (REST, GraphQL, WebSocket)
│
├── services/                           # 🔧 Microservices
│   ├── README.md
│   ├── 04-2-services-overview.md       # Services overview
│   ├── 05-users-service.md             # Users Service
│   ├── 06-stories-service.md           # Stories Service
│   ├── 07-comments-service.md          # Comments Service
│   ├── 08-search-service.md            # Search Service
│   ├── 09-ai-service.md                # AI Service
│   ├── 10-notification-service.md      # Notification Service
│   ├── 11-websocket-service.md         # WebSocket Service
│   ├── 12-social-service.md            # Social Service
│   ├── 13-community-service.md         # Community Service
│   └── 14-monetization-service.md      # Monetization Service
│
├── clients/                            # 💻 Client Applications
│   ├── README.md
│   ├── 13-3-web.md                     # Next.js Web Frontend
│   ├── keyboard-shortcuts.md           # ⌨️ Keyboard Shortcuts (Design Spec + Quick Ref) ⭐
│   ├── 14-4-desktop.md                 # Electron Desktop App
│   ├── 15-5-mobile-ios.md              # iOS Native App
│   └── 16-6-mobile-android.md          # Android Native App
│
└── shared/                             # 📦 Shared Library
    ├── README.md
    └── 17-7-shared.md                  # Shared types, DTOs, Proto files
```

**⭐ = Newly added or recently updated**

---

**Tài liệu này được tổ chức thành các folder để dễ đọc và tra cứu hơn.**
