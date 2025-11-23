---
alwaysApply: true
---

# 📖 Hướng dẫn sử dụng Structure Documentation

## 🎯 Mục đích

Tài liệu này hướng dẫn chi tiết cách tìm kiếm, navigate, và sử dụng tài liệu structure một cách hiệu quả. Tài liệu được tổ chức thành nhiều file nhỏ để dễ đọc, tra cứu và bảo trì.

## 📋 Bản đồ tài liệu đầy đủ

### 1. Entry Points (Điểm bắt đầu)

#### 📋 [Overview README](./README.md)
- Mục đích và vai trò của folder overview
- Cấu trúc files và mô tả từng file
- Quick navigation guide
- **Khi nào dùng**: Lần đầu vào folder overview, cần hiểu tổng quan

#### 🏗️ [01-overview.md](./01-overview.md)
- Architecture diagram tổng thể
- Package quick reference table (ports, databases, technologies)
- Communication patterns
- **Khi nào dùng**: Cần hiểu kiến trúc, tìm thông tin nhanh về package

#### 📖 [HOW_TO_USE.md](./HOW_TO_USE.md) (file này)
- Hướng dẫn chi tiết cách tìm kiếm
- Navigation guide
- Examples và use cases
- **Khi nào dùng**: Không biết tìm thông tin ở đâu

### 2. Root & Infrastructure

#### 🏗️ [02-root-structure.md](../root/02-root-structure.md)
- Root configuration files (package.json, pnpm-workspace.yaml, tsconfig.base.json, turbo.json)
- Docker compose configuration
- Documentation structure
- Scripts và utilities
- **Khi nào dùng**: Cần hiểu cấu trúc monorepo, setup development environment

### 3. Gateway & Services

#### 🌐 [03-1-gateway.md](../gateway/03-1-gateway.md)
- API Gateway (BFF Layer) chi tiết
- Authentication & Authorization
- REST API, GraphQL, WebSocket endpoints
- gRPC clients
- Source code structure
- **Khi nào dùng**: Làm việc với Gateway, cần hiểu routing, auth

#### 🔧 [04-2-services-overview.md](../services/04-2-services-overview.md)
- Tổng quan về tất cả microservices
- Communication patterns
- Technology stack
- **Khi nào dùng**: Cần hiểu tổng quan về services

#### 👤 [05-users-service.md](../services/05-users-service.md)
- User management (registration, login, profiles)
- Library management (library, bookshelf, wishlist)
- Reading Preferences (font size, theme, etc.)
- Bookmarks & Annotations
- Reading Progress tracking
- **Khi nào dùng**: Làm việc với user features, library, reading preferences

#### 📚 [06-stories-service.md](../services/06-stories-service.md)
- Story & Chapter management
- Content storage (S3 + CloudFront)
- Discovery & Engagement features:
  - Ranking Charts (Monthly Votes, Sales, Recommendations, Popularity)
  - Editor's Picks
  - Genre Browsing
- **Khi nào dùng**: Làm việc với content, discovery, rankings

#### 💬 [07-comments-service.md](../services/07-comments-service.md)
- Hierarchical Community Interaction System:
  - **Micro Level**: Paragraph Comments (Duanping)
  - **Meso Level**: Chapter-End Comments (本章说)
  - **Macro Level**: Book Reviews & Discussion Forums
  - **Platform**: Polls & Quizzes
- Comments, Ratings, Reviews
- **Khi nào dùng**: Làm việc với comments, reviews, community interactions

#### 🔍 [08-search-service.md](../services/08-search-service.md)
- Full-text search với MeiliSearch
- Story indexing
- Post indexing
- Search queries và filters
- **Khi nào dùng**: Làm việc với search functionality

#### 🤖 [09-ai-service.md](../services/09-ai-service.md)
- Text-to-Speech (TTS) - Google Cloud TTS, Azure, AWS Polly
- Translation - Google Translate, DeepL
- Dictionary - Word lookup, definitions, pinyin
- Summarization - Story/chapter summaries (Gemini)
- Recommendation Engine - AI-powered story recommendations
- **Khi nào dùng**: Làm việc với AI features, recommendations

#### 📧 [10-notification-service.md](../services/10-notification-service.md)
- Email notifications (Nodemailer)
- Push notifications (Firebase Admin)
- SMS notifications (Twilio)
- Event listeners và triggers
- **Khi nào dùng**: Làm việc với notifications, email, push

#### 🔌 [11-websocket-service.md](../services/11-websocket-service.md)
- Real-time communication
- Live comments
- Real-time notifications
- Social feed updates
- Socket.IO integration
- **Khi nào dùng**: Làm việc với real-time features, WebSocket

#### 👥 [12-social-service.md](../services/12-social-service.md)
- Posts, Groups, Follows
- Feed aggregation
- Social events
- **Khi nào dùng**: Làm việc với social features, feeds

#### 🏘️ [13-community-service.md](../services/13-community-service.md)
- Community Interactions (Hierarchical System)
- Fan Economy:
  - Tipping System (打赏)
  - Fan Rankings (粉丝榜)
  - Gamification System
  - Monthly Votes System
  - Author-Fan Interactions
- **Khi nào dùng**: Làm việc với community, fan economy, tipping

#### 💰 [14-monetization-service.md](../services/14-monetization-service.md)
- Pay-Per-Chapter (PPC) Business Model
- Virtual Currency System (Wallet, top-up, transactions)
- Pricing Engine (Character-based pricing)
- Paywall System (Free chapters & access control)
- Payment Processing (Purchase flow)
- Subscriptions (All-You-Can-Read & VIP Levels)
- **Khi nào dùng**: Làm việc với payments, monetization, subscriptions

### 4. Client Applications

#### 🌐 [13-3-web.md](../clients/13-3-web.md)
- Next.js Web Frontend (PWA)
- Core Reader Interface (Based on Qidian/QQ Reading)
- Storefront Components & Browse Pages
- Library Feature Components
- Social Feature Components
- Community UI (Paragraph Comments, Chapter Comments, Reviews, Forums)
- AI Integration (TTS Player, Dictionary Popup, Recommendations)
- State Management (React Query + Zustand)
- **Khi nào dùng**: Làm việc với web frontend, Next.js

#### 💻 [14-4-desktop.md](../clients/14-4-desktop.md)
- Electron Desktop App
- Cross-platform desktop application
- Native OS integration
- **Khi nào dùng**: Làm việc với desktop app

#### 📱 [15-5-mobile-ios.md](../clients/15-5-mobile-ios.md)
- iOS Native App (SwiftUI)
- Core Reader Interface
- MVVM + Repository Pattern
- Core Data for local storage
- Offline-first architecture
- **Khi nào dùng**: Làm việc với iOS app, SwiftUI

#### 🤖 [16-6-mobile-android.md](../clients/16-6-mobile-android.md)
- Android Native App (Jetpack Compose)
- Core Reader Interface
- MVVM + Repository Pattern
- Room Database for local storage
- Offline-first architecture
- **Khi nào dùng**: Làm việc với Android app, Jetpack Compose

#### ⌨️ [keyboard-shortcuts.md](../clients/keyboard-shortcuts.md)
- Keyboard Shortcuts Design Specification
- Power-user keyboard navigation
- Quick reference guide
- **Khi nào dùng**: Thiết kế keyboard shortcuts, power-user features

### 5. Shared Library

#### 📦 [17-7-shared.md](../shared/17-7-shared.md)
- **CRITICALLY IMPORTANT**: Tất cả contracts phải được định nghĩa ở đây trước
- Types (TypeScript Interfaces)
- Validation (DTOs & Schemas)
- Constants & Enums
- Proto files (gRPC contracts)
- **Khi nào dùng**: Định nghĩa contracts, types, DTOs mới

## 🔍 Cách tìm thông tin

### Tìm theo chức năng (Feature-Based)

#### Authentication & Authorization
**Câu hỏi**: "Làm thế nào để implement authentication?"
- **Gateway Auth**: [03-1-gateway.md](../gateway/03-1-gateway.md) - Auth Module, JWT Strategy
- **User Auth**: [05-users-service.md](../services/05-users-service.md) - Auth Service, Registration, Login

**Câu hỏi**: "Làm thế nào để protect routes?"
- [03-1-gateway.md](../gateway/03-1-gateway.md) - Auth Guards, Decorators

#### Reading Features
**Câu hỏi**: "Làm thế nào để implement reader interface?"
- **Web Reader**: [13-3-web.md](../clients/13-3-web.md) - Reader Interface Components
- **Mobile Readers**: [15-5-mobile-ios.md](../clients/15-5-mobile-ios.md) | [16-6-mobile-android.md](../clients/16-6-mobile-android.md)

**Câu hỏi**: "Làm thế nào để save reading preferences?"
- [05-users-service.md](../services/05-users-service.md) - Reading Preferences Module

**Câu hỏi**: "Làm thế nào để implement bookmarks?"
- [05-users-service.md](../services/05-users-service.md) - Bookmarks & Annotations Modules

#### Library Management
**Câu hỏi**: "Làm thế nào để manage user library?"
- **Backend**: [05-users-service.md](../services/05-users-service.md) - Library, Bookshelf, Wishlist Modules
- **Frontend**: [13-3-web.md](../clients/13-3-web.md) - Library Feature Components

#### Discovery & Search
**Câu hỏi**: "Làm thế nào để implement search?"
- [08-search-service.md](../services/08-search-service.md) - Full-text search với MeiliSearch

**Câu hỏi**: "Làm thế nào để show rankings?"
- [06-stories-service.md](../services/06-stories-service.md) - Ranking Charts, Editor's Picks

#### Community & Social
**Câu hỏi**: "Làm thế nào để implement comments?"
- [07-comments-service.md](../services/07-comments-service.md) - Hierarchical Comment System
- [13-3-web.md](../clients/13-3-web.md) - Community UI Components

**Câu hỏi**: "Làm thế nào để implement fan economy?"
- [13-community-service.md](../services/13-community-service.md) - Fan Economy, Tipping System

**Câu hỏi**: "Làm thế nào để implement social features?"
- [12-social-service.md](../services/12-social-service.md) - Posts, Groups, Follows
- [13-3-web.md](../clients/13-3-web.md) - Social Feature Components

#### AI Features
**Câu hỏi**: "Làm thế nào để implement TTS?"
- [09-ai-service.md](../services/09-ai-service.md) - TTS Service
- [13-3-web.md](../clients/13-3-web.md) - TTS Player Integration

**Câu hỏi**: "Làm thế nào để implement recommendations?"
- [09-ai-service.md](../services/09-ai-service.md) - Recommendation Engine

#### Monetization
**Câu hỏi**: "Làm thế nào để implement payments?"
- [14-monetization-service.md](../services/14-monetization-service.md) - Payment Processing, Virtual Currency

**Câu hỏi**: "Làm thế nào để implement subscriptions?"
- [14-monetization-service.md](../services/14-monetization-service.md) - Subscriptions Module

#### Real-time Communication
**Câu hỏi**: "Làm thế nào để implement real-time features?"
- [11-websocket-service.md](../services/11-websocket-service.md) - WebSocket Service
- [13-3-web.md](../clients/13-3-web.md) - WebSocket Integration

### Tìm theo công nghệ (Technology-Based)

#### NestJS
**Câu hỏi**: "Làm thế nào để setup NestJS service?"
- [04-2-services-overview.md](../services/04-2-services-overview.md) - Services Overview
- [05-users-service.md](../services/05-users-service.md) - Example service structure

**Câu hỏi**: "Làm thế nào để implement gRPC?"
- [03-1-gateway.md](../gateway/03-1-gateway.md) - gRPC Clients
- [05-users-service.md](../services/05-users-service.md) - gRPC Server

**Câu hỏi**: "Làm thế nào để implement Event Bus?"
- [04-2-services-overview.md](../services/04-2-services-overview.md) - Event Bus Communication
- [10-notification-service.md](../services/10-notification-service.md) - Event Listeners

#### Next.js
**Câu hỏi**: "Làm thế nào để setup Next.js app?"
- [13-3-web.md](../clients/13-3-web.md) - Next.js Web Frontend

**Câu hỏi**: "Làm thế nào để manage state?"
- [13-3-web.md](../clients/13-3-web.md) - State Management (React Query + Zustand)

#### Mobile (iOS/Android)
**Câu hỏi**: "Làm thế nào để setup iOS app?"
- [15-5-mobile-ios.md](../clients/15-5-mobile-ios.md) - iOS Native App

**Câu hỏi**: "Làm thế nào để setup Android app?"
- [16-6-mobile-android.md](../clients/16-6-mobile-android.md) - Android Native App

**Câu hỏi**: "Làm thế nào để implement offline support?"
- [15-5-mobile-ios.md](../clients/15-5-mobile-ios.md) - Core Data, Offline-first
- [16-6-mobile-android.md](../clients/16-6-mobile-android.md) - Room Database, Offline-first

#### Database
**Câu hỏi**: "Làm thế nào để setup Prisma?"
- [05-users-service.md](../services/05-users-service.md) - Prisma Schema Example

**Câu hỏi**: "Làm thế nào để setup MeiliSearch?"
- [08-search-service.md](../services/08-search-service.md) - MeiliSearch Integration

#### gRPC & Contracts
**Câu hỏi**: "Làm thế nào để define proto files?"
- [17-7-shared.md](../shared/17-7-shared.md) - Proto files

**Câu hỏi**: "Làm thế nào để define DTOs?"
- [17-7-shared.md](../shared/17-7-shared.md) - Validation DTOs & Schemas

## 📝 Quy tắc quan trọng

Khi làm việc với structure, **LUÔN NHỚ** các quy tắc sau:

### Rule #1: Services NEVER touch each other's databases
- ❌ **DON'T**: users-service SELECT from stories table
- ✅ **DO**: users-service calls stories-service via gRPC

**Example:**
```typescript
// ❌ WRONG
const story = await prisma.story.findUnique({ where: { id } }); // In users-service

// ✅ CORRECT
const story = await storiesClient.getStory({ id }); // gRPC call
```

### Rule #2: Use the right communication channel
- **Synchronous (immediate answer needed)**: Use gRPC
- **Asynchronous (just announce event)**: Use Event Bus

**Example:**
```typescript
// ✅ Sync: Gateway needs story data NOW
const story = await storiesClient.getStory({ id }); // gRPC

// ✅ Async: Just announce that story was created
await eventBus.emit('story.created', { storyId }); // Event Bus
```

### Rule #3: ALL contracts MUST be defined in 7-shared first
- ❌ **DON'T**: Hard-code DTOs in services
- ✅ **DO**: Define in 7-shared, import everywhere

**Example:**
```typescript
// ❌ WRONG (in users-service)
interface CreateUserDto {
  email: string;
  password: string;
}

// ✅ CORRECT (in 7-shared)
// shared/validation/users.dto.ts
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

### Rule #4: Gateway is a "Bouncer", NOT the "Brain"
- ✅ **DO**: Authentication, Routing, Rate Limiting
- ❌ **DON'T**: Business logic (push to services)

**Example:**
```typescript
// ❌ WRONG (in Gateway)
@Get('/stories/:id')
async getStory(@Param('id') id: string) {
  // Business logic in Gateway - WRONG!
  const story = await prisma.story.findUnique({ where: { id } });
  return story;
}

// ✅ CORRECT (in Gateway)
@Get('/stories/:id')
async getStory(@Param('id') id: string) {
  // Just route to service
  return this.storiesClient.getStory({ id }); // gRPC call
}
```

### Rule #5: State Management
- **Web**: React Query (server data), Zustand (UI state only)
- **Mobile**: MVVM + Repository Pattern

**Example:**
```typescript
// ✅ Web: React Query for server data
const { data } = useQuery(['stories'], fetchStories);

// ✅ Web: Zustand for UI state only
const isSidebarOpen = useStore(state => state.isSidebarOpen);

// ✅ Mobile: Repository decides network vs local
class StoryRepository {
  async getStory(id: string) {
    // Check local first, then network
    const local = await localDb.getStory(id);
    if (local) return local;
    return await api.getStory(id);
  }
}
```

## 🔄 Cập nhật tài liệu

**⚠️ QUAN TRỌNG:** Khi thay đổi code, bạn **PHẢI** cập nhật structure documentation tương ứng.

Xem **[STRUCTURE_MAINTENANCE.md](../STRUCTURE_MAINTENANCE.md)** để biết chi tiết về:
- Checklist khi nào cần cập nhật
- Workflow cập nhật structure documentation
- Examples các trường hợp cụ thể
- Best practices

### Quick Workflow

Khi thêm tính năng mới hoặc thay đổi cấu trúc, cần cập nhật tài liệu theo thứ tự:

### 1. Cập nhật file tương ứng
Tìm file service/package/client liên quan và cập nhật:
- Thêm module/feature mới
- Cập nhật source code structure
- Thêm endpoints/APIs mới

### 2. Cập nhật contracts (nếu có)
Nếu có thay đổi về contracts (types, DTOs, proto files):
- Cập nhật [17-7-shared.md](../shared/17-7-shared.md) trước
- Sau đó cập nhật các services/apps sử dụng contracts

### 3. Cập nhật overview
Nếu có thay đổi về architecture:
- Cập nhật [01-overview.md](./01-overview.md) - Package Quick Reference table
- Cập nhật architecture diagram nếu cần

### 4. Cập nhật README
Nếu có thay đổi về cấu trúc tài liệu:
- Cập nhật [README.md](./README.md) trong folder tương ứng
- Cập nhật [Main README](../README.md) nếu cần

### 5. Cập nhật HOW_TO_USE
Nếu có thêm file mới hoặc thay đổi navigation:
- Cập nhật [HOW_TO_USE.md](./HOW_TO_USE.md) - Bản đồ tài liệu

## 💡 Tips & Best Practices

### 1. Sử dụng Ctrl+F (hoặc Cmd+F)
Mỗi file đều có thể search được. Sử dụng Ctrl+F để tìm keywords:
- Tên function/class
- Tên service/package
- Technology keywords

### 2. Follow the links
Mỗi file đều có links đến các file liên quan ở cuối. Sử dụng links để navigate:
- Từ overview → service details
- Từ service → client integration
- Từ client → shared contracts

### 3. Start from overview
Nếu không chắc bắt đầu từ đâu:
1. Đọc [01-overview.md](./01-overview.md) để hiểu architecture
2. Sử dụng Package Quick Reference table để tìm package
3. Đọc file chi tiết của package đó

### 4. Use feature-based navigation
Khi cần implement một feature:
1. Tìm feature trong phần "Tìm theo chức năng" ở trên
2. Đọc file backend service trước
3. Đọc file client integration sau

### 5. Check related documentation
Mỗi file đều có phần "Related Documentation" hoặc "Xem thêm" ở cuối. Sử dụng để tìm:
- Related services
- Client integrations
- Shared contracts

### 6. Read the rules
Luôn đọc phần "Quy tắc quan trọng" trước khi code:
- Tránh vi phạm Rule #1 (database access)
- Tránh vi phạm Rule #3 (contracts)
- Tránh vi phạm Rule #4 (gateway logic)

## 🎯 Common Use Cases

### Use Case 1: Implement a new feature
1. Đọc [01-overview.md](./01-overview.md) để hiểu architecture
2. Tìm service liên quan trong "Tìm theo chức năng"
3. Đọc service file để hiểu implementation
4. Đọc client file để hiểu integration
5. Đọc shared file để hiểu contracts

### Use Case 2: Debug an issue
1. Xác định service/client liên quan
2. Đọc file tương ứng để hiểu flow
3. Check communication patterns (gRPC, Event Bus)
4. Check related services

### Use Case 3: Add a new service
1. Đọc [04-2-services-overview.md](../services/04-2-services-overview.md) để hiểu pattern
2. Tạo service file mới (ví dụ: 15-new-service.md)
3. Cập nhật [01-overview.md](./01-overview.md) - Package Quick Reference
4. Cập nhật [services/README.md](../services/README.md)
5. Cập nhật [HOW_TO_USE.md](./HOW_TO_USE.md) - Bản đồ tài liệu

### Use Case 4: Understand data flow
1. Đọc [01-overview.md](./01-overview.md) - Communication Patterns
2. Đọc service file để hiểu endpoints
3. Đọc client file để hiểu integration
4. Check Event Bus events nếu có

---

**📖 Xem thêm:** 
- [README](./README.md) - Overview & Navigation
- [01-overview.md](./01-overview.md) - Architecture Overview
- [Main README](../README.md) - Main structure documentation
