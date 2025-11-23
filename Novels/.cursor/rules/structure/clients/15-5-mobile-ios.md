---
alwaysApply: true
---

# 📖 Hướng dẫn Sử dụng Documentation này

## 🎯 Công dụng của File này

File này là **bản thiết kế chi tiết (blueprint)** cho package `5-mobile-ios` - iOS Native App. Nó mô tả:

1. **Cấu trúc thư mục (Folder Structure):** Tất cả các file và folder cần tạo trong Xcode project
2. **Architecture Pattern:** MVVM + Repository Pattern (Rule #5, #8)
3. **Components & Views:** Tất cả SwiftUI Views cần implement
4. **ViewModels:** Business logic và state management
5. **Repositories:** Data layer - quyết định fetch từ network hay local database
6. **Development Steps:** Lộ trình triển khai từng feature theo thứ tự ưu tiên

## 🏗️ Cấu trúc Tổng Hệ thống

```
Monorepo Structure:
├── 1-gateway/          # API Gateway (GraphQL endpoint)
├── 2-services/         # Microservices (users, stories, ai, etc.)
├── 3-web/              # Next.js Web Frontend
├── 4-desktop/          # Electron Desktop App
├── 5-mobile-ios/       # ← BẠN ĐANG Ở ĐÂY: iOS Native App
├── 6-mobile-android/   # Android Native App
└── 7-shared/           # Shared Types, DTOs (convert sang Swift structs)
```

**Luồng dữ liệu (MVVM + Repository Pattern):**
```
SwiftUI View
    ↓ (observes @Published)
ViewModel (@Published properties)
    ↓ (calls methods)
Repository (decides: Network or Local?)
    ├── GraphQLService (Apollo Client) → 1-gateway → 2-services
    └── OfflineService (Core Data) → Local Database
```

**🔄 Cross-Device Synchronization (CRITICAL - Rule #8):**
```
iOS App (Device A)
    ↓ (updates Core Data, syncs to backend)
Backend (users-service)
    ↓ (syncs to all devices via WebSocket)
Web App (Device B) ← Android App (Device C) ← Desktop App (Device D)
    ↓ (receives real-time updates)
All devices have identical state (library, progress, preferences)
```

**⚠️ CRITICAL REQUIREMENT:** 
Synchronization is the MOST IMPORTANT feature. All data must sync seamlessly across web, mobile (iOS/Android), and desktop:
- **Library items** (stories, bookshelves, wishlist)
- **Reading progress** (chapter, position, completion)
- **Reading preferences** (background mode, font size, reading mode, brightness)
- **Bookmarks & Annotations**
- **User must see same state on ALL devices** - any sync failure is a critical violation

**⚠️ Desktop Preferences Note:**
- **Mobile apps do NOT need desktop preferences** (tab state, layout, focus mode, split-view)
- **Sync mechanism:** Mobile apps should ignore desktop preferences when syncing
- **Separate sync endpoints:** Consider separate sync endpoints for mobile vs desktop preferences
- **No conflict:** Desktop preferences are desktop-only and should not affect mobile sync

## 📚 Cách Đọc Documentation này

### 1. **Hiểu Architecture Pattern:**
   - **MVVM:** View chỉ hiển thị, ViewModel xử lý logic
   - **Repository Pattern:** Repository quyết định fetch từ đâu (network/local)
   - **Offline-First:** Luôn load từ Core Data trước, sau đó sync từ network

### 2. **Đọc theo thứ tự:**
   - **Package Info:** Hiểu tech stack, architecture
   - **Source Code Structure:** Xem folder structure chi tiết
   - **Development Steps:** Làm theo từng bước (1 → 17)

### 3. **Tìm kiếm nhanh:**
   - Dùng `Cmd+F` để tìm View/ViewModel/Repository cụ thể
   - Ví dụ: Tìm "StoryReaderView" → Thấy ở `View/StoryReaderView.swift`

## 🔨 Workflow: Từ Documentation → Code

### Ví dụ: Implement Reader Interface

**Bước 1: Đọc Development Steps (dòng 270-426)**
```
8. Reader Interface (Core Reading Experience):
   - UI Customization: Tap-to-Show Controls, Background Modes...
```

**Bước 2: Tìm View Structure (dòng 82-193)**
```
├── 📁 View/
│   ├── StoryReaderView.swift        # Reader interface
│   └── Settings/
│       └── ReadingPreferencesView.swift
```

**Bước 3: Tìm ViewModel (dòng 57-80)**
```
├── 📁 ViewModel/
│   ├── StoryReaderViewModel.swift   # Reader logic
│   └── SettingsViewModel.swift
```

**Bước 4: Tìm Repository (dòng 206-224)**
```
├── 📁 Repository/
│   ├── StoryRepository.swift        # Decides: GraphQLService or OfflineService
│   └── ReadingProgressRepository.swift
```

**Bước 5: Implement theo thứ tự:**
1. Tạo Model structs (convert từ 7-shared types)
2. Tạo Repository với logic: Load từ Core Data → Fetch từ GraphQL → Update Core Data
3. Tạo ViewModel với @Published properties, gọi Repository
4. Tạo SwiftUI View, observe ViewModel

## 💡 Best Practices khi Code

### 1. **MVVM Pattern:**
```swift
// ✅ View: Chỉ hiển thị UI
struct StoryReaderView: View {
    @StateObject var viewModel = StoryReaderViewModel()
    
    var body: some View {
        Text(viewModel.chapterContent)
            .onAppear { viewModel.loadChapter() }
    }
}

// ✅ ViewModel: Xử lý logic
class StoryReaderViewModel: ObservableObject {
    @Published var chapterContent: String = ""
    private let repository: StoryRepository
    
    func loadChapter() {
        repository.getChapter(id: chapterId) { [weak self] result in
            self?.chapterContent = result.content
        }
    }
}
```

### 2. **Repository Pattern (Offline-First):**
```swift
// ✅ Repository: Quyết định fetch từ đâu
class StoryRepository {
    private let graphQLService: GraphQLService
    private let offlineService: OfflineService
    
    func getChapter(id: String, completion: @escaping (Chapter) -> Void) {
        // 1. Load từ Core Data trước (instant)
        if let chapter = offlineService.getChapter(id: id) {
            completion(chapter)
        }
        
        // 2. Fetch từ network (background)
        graphQLService.fetchChapter(id: id) { [weak self] result in
            // 3. Update Core Data
            self?.offlineService.saveChapter(result)
            completion(result)
        }
    }
}
```

### 3. **Import Types từ 7-shared:**
```swift
// ⚠️ Lưu ý: 7-shared là TypeScript, cần convert sang Swift
// Tạo Model/Story.swift dựa trên StoryDto từ 7-shared
struct Story: Codable {
    let id: String
    let title: String
    let author: String
    // ... map từ StoryDto
}
```

### 4. **Core Data Entities:**
```swift
// Tạo Core Data Entity tương ứng với Model
// StoryEntity (Core Data) ↔ Story (Swift struct)
```

## 🔗 Liên kết Quan trọng

- **Mobile Coding Guide:** [MOBILE_CODING_GUIDE.md](../MOBILE_CODING_GUIDE.md) - ⭐ **ĐỌC TRƯỚC**
- **Backend Services:** [Services Documentation](../services/04-2-services-overview.md)
- **Shared Types:** [7-shared Documentation](../shared/17-7-shared.md) - Convert sang Swift
- **Gateway API:** [Gateway Documentation](../gateway/03-1-gateway.md) - GraphQL schema

## ⚠️ Lưu Ý Quan trọng

1. **Rule #8 (Offline-First):** Luôn load từ Core Data trước, fetch network sau
2. **Rule #5 (MVVM):** View chỉ observe ViewModel, không gọi Repository trực tiếp
3. **Repository Pattern:** Repository là single source of truth cho data fetching
4. **Type Conversion:** 7-shared types (TypeScript) → Swift structs (manual conversion)

---

├── 📦 5-mobile-ios/                    # 📱 iOS NATIVE APP (Xcode)
    │   │
    │   ├── 📋 Package Info
    │   │   ├── **Architecture:** MVVM + Repository Pattern (Rule #5, #8)
    │   │   ├── **Key Tech:**
    │   │   │   - `SwiftUI` (UI framework)
    │   │   │   - `Combine` (reactive state management)
    │   │   │   - `Core Data` (offline database)
    │   │   │   - `Apollo iOS Client` (GraphQL client)
    │   │   │   - `AVSpeechSynthesizer` (native TTS)
    │   │   │   - `UniformTypeIdentifiers` (file import/export)
    │   │   │   - `SwiftUICharts` (reading statistics)
    │   │   │   - `CoreSpotlight` (advanced search indexing)
    │   │   └── **Deployment:** App Store (iOS, iPadOS)
    │   │
    │   │   ├── **Mobile-Specific Features:**
    │   │   │   - **Offline-First:** Full offline support with Core Data (Rule #8)
    │   │   │   - **Download for Offline:** Download stories/chapters for offline reading
    │   │   │   - **Bulk Operations:** Select multiple items, batch actions (delete, move to bookshelf, etc.)
    │   │   │   - **Export/Import:** Export library, annotations, reading progress (Share Sheet, Files app)
    │   │   │   - **Advanced Search/Filter:** Complex queries, saved filters, Spotlight integration
    │   │   │   - **Reading Statistics:** WPM (words per minute), reading time, progress charts
    │   │   │   - **Multi-column Reading:** Newspaper-style multi-column layout (iPad)
    │   │   │   - **Reader Sidebar:** Swipeable sidebar for notes/bookmarks
    │   │   │   - **Rich Text Annotations:** Advanced annotation tools with formatting
    │   │   │   - **Customizable Layout:** Layout preferences (grid/list, sort options)
    │   │   │   - **Haptic Feedback:** Tactile feedback for interactions
    │   │   │   - **Widget Support:** Home screen widgets (reading progress, recent stories)
    │   │   │   - **Shortcuts Integration:** Siri Shortcuts for quick actions
    │   │   │   - **Share Extensions:** Share content from other apps
    │   │
    │   ├── 📁 Source Code Structure
    │   │   └── TruyenApp/
    │   │       ├── AppDelegate.swift                    # App entry point (Sentry integration)
    │   │       │
    │   │       ├── 📁 Model/                            # Data Models (from 7-shared)
    │   │       │   ├── Story.swift                      # Story model struct
    │   │       │   ├── Chapter.swift                    # Chapter model struct
    │   │       │   ├── User.swift                       # User model struct
    │   │       │   ├── Post.swift                       # Post model struct
    │   │       │   ├── Group.swift                      # Group model struct
      │   │       │   ├── Library.swift                   # Library model struct (Enhanced - 2.1, 2.2, 2.3)
      │   │       │   ├── Bookshelf.swift                  # Bookshelf model struct (Enhanced - 2.1)
      │   │       │   ├── Tag.swift                        # Tag model struct (NEW - 2.1)
      │   │       │   ├── FilteredView.swift                # FilteredView model struct (NEW - 2.1)
      │   │       │   ├── SystemList.swift                  # SystemList model struct (NEW - 2.1)
      │   │       │   ├── FilterQuery.swift                 # FilterQuery model struct (NEW - 2.1)
    │   │       │   ├── ReadingPreferences.swift         # Reading preferences model
    │   │       │   ├── Wallet.swift                     # Wallet & Virtual Currency (NEW)
    │   │       │   ├── Transaction.swift                # Transaction model (NEW)
    │   │       │   ├── Subscription.swift               # Subscription model (NEW)
    │   │       │   ├── Tip.swift                        # Tipping model (NEW)
    │   │       │   ├── Vote.swift                       # Vote model (NEW)
    │   │       │   ├── Notification.swift               # Notification model (NEW)
    │   │       │   └── Translation.swift                # Translation model (NEW)
    │   │       │
    │   │       ├── 📁 ViewModel/                        # MVVM ViewModels
    │   │       │   ├── StoryReaderViewModel.swift       # Reader logic (uses TextToSpeechManager)
      │   │       │   ├── LibraryViewModel.swift           # Library management (Enhanced - 2.1, 2.2, 2.3)
      │   │       │   ├── BookshelfViewModel.swift          # Bookshelf organization (Enhanced - 2.1)
      │   │       │   ├── LibraryAutoOrganizationViewModel.swift  # Auto-organization (NEW - 2.1)
      │   │       │   ├── TagsViewModel.swift              # Tag management (NEW - 2.1)
      │   │       │   ├── FilteredViewViewModel.swift      # Filtered views (NEW - 2.1)
      │   │       │   ├── DownloadManagerViewModel.swift   # Download management (NEW - 2.2)
      │   │       │   ├── SyncStatusViewModel.swift        # Sync status (Enhanced - 2.3)
    │   │       │   ├── FeedViewModel.swift              # Social feed
    │   │       │   ├── GroupViewModel.swift             # Group management
    │   │       │   ├── StorefrontViewModel.swift         # Discovery & Storefront (NEW)
    │   │       │   ├── RankingsViewModel.swift          # Rankings (NEW)
    │   │       │   ├── RecommendationsViewModel.swift   # Personalized recommendations (NEW)
    │   │       │   ├── CommunityViewModel.swift         # Community interactions (NEW)
    │   │       │   ├── SettingsViewModel.swift          # TTS & app settings
      │   │       │   ├── BulkOperationsViewModel.swift    # Bulk operations (NEW)
      │   │       │   ├── ExportImportViewModel.swift      # Export/Import (Enhanced - from web)
      │   │       │   ├── AdvancedSearchViewModel.swift    # Advanced search (Enhanced - from web)
      │   │       │   ├── CommandPaletteViewModel.swift    # Command palette (NEW - from web, mobile-optimized)
      │   │       │   ├── AnnotationTemplatesViewModel.swift # Annotation templates (NEW - from web)
      │   │       │   │   # - Save annotation templates for quick use
      │   │       │   │   # - Template management (create, edit, delete)
      │   │       │   │   # - Apply templates to new annotations
    │   │       │   ├── ReadingStatsViewModel.swift      # Reading statistics (NEW)
    │   │       │   ├── WalletViewModel.swift            # Wallet & Payments (NEW)
    │   │       │   ├── PaywallViewModel.swift           # Paywall & Purchase (NEW)
    │   │       │   ├── SubscriptionViewModel.swift      # Subscription management (NEW)
    │   │       │   ├── TippingViewModel.swift           # Tipping functionality (NEW)
    │   │       │   ├── VotesViewModel.swift             # Monthly votes (NEW)
    │   │       │   ├── FanRankingsViewModel.swift       # Fan rankings (NEW)
    │   │       │   ├── TranslationViewModel.swift       # Translation (NEW)
    │   │       │   ├── SummarizationViewModel.swift     # Summarization (NEW)
    │   │       │   └── NotificationsViewModel.swift     # Notifications (NEW)
    │   │       │
    │   │       ├── 📁 View/                             # SwiftUI Views
    │   │       │   ├── StoryReaderView.swift            # Reader interface
      │   │       │   ├── LibraryView.swift                # Library dashboard (Enhanced - 2.1, 2.2, 2.3)
      │   │       │   ├── BookshelfView.swift              # Bookshelf management (Enhanced - 2.1)
      │   │       │   │
      │   │       │   ├── 📁 Library/AutoOrganization/      # Auto-Organization Views (NEW - 2.1)
      │   │       │   │   ├── LibraryAutoOrganizationView.swift  # Auto-grouping by author/series
      │   │       │   │   ├── AuthorGroupView.swift            # Books grouped by author
      │   │       │   │   ├── SeriesGroupView.swift            # Books grouped by series
      │   │       │   │   └── SystemListsView.swift            # System lists (Favorites, To Read, etc.)
      │   │       │   │
      │   │       │   ├── 📁 Library/Tags/                  # Tag Management Views (NEW - 2.1)
      │   │       │   │   ├── TagManagerView.swift            # Tag creation, editing, hierarchy
      │   │       │   │   ├── TagSelectorView.swift            # Multi-select tag picker
      │   │       │   │   ├── TagChipView.swift                # Individual tag chip
      │   │       │   │   └── TagHierarchyView.swift          # Tag hierarchy tree view
      │   │       │   │
      │   │       │   ├── 📁 Library/FilteredViews/         # Filtered Views (NEW - 2.1)
      │   │       │   │   ├── FilteredViewBuilderView.swift  # Query builder UI
      │   │       │   │   ├── FilteredViewListView.swift     # List of saved filtered views
      │   │       │   │   └── FilterQueryBuilderView.swift    # Visual query builder
      │   │       │   │
      │   │       │   ├── 📁 Library/DownloadManagement/    # Download Management Views (NEW - 2.2)
      │   │       │   │   ├── DownloadManagerView.swift      # Download queue and management
      │   │       │   │   ├── DownloadQueueView.swift        # Download queue list
      │   │       │   │   ├── StorageManagerView.swift        # Storage usage and cleanup
      │   │       │   │   └── DownloadSettingsView.swift     # Auto-download preferences
      │   │       │   │
      │   │       │   ├── 📁 Library/Sync/                    # Sync Views (Enhanced - 2.3)
      │   │       │   │   ├── SyncStatusView.swift           # Sync status display
      │   │       │   │   └── SyncConflictResolverView.swift  # Conflict resolution dialog
    │   │       │   ├── FeedView.swift                   # Social feed
    │   │       │   ├── GroupListView.swift              # Groups listing
    │   │       │   ├── GroupDetailView.swift            # Group detail
    │   │       │   ├── StorefrontView.swift              # Discovery & Storefront (NEW)
    │   │       │   ├── RankingsView.swift               # Rankings listing (NEW)
    │   │       │   ├── RecommendationsView.swift       # Recommendations (NEW)
    │   │       │   │
    │   │       │   ├── 📁 Community/                    # Community Interaction Views (Hierarchical) (NEW)
    │   │       │   │   ├── 📁 paragraph-comments/      # Micro: Paragraph Comments (Duanping)
    │   │       │   │   │   ├── ParagraphCommentBubbleView.swift  # Comment bubble on paragraph
    │   │       │   │   │   ├── ParagraphCommentPanelView.swift   # Panel showing all paragraph comments
    │   │       │   │   │   ├── QuickReactionButtonsView.swift    # Quick reaction buttons (Haha, WTF, etc.)
    │   │       │   │   │   └── ParagraphCommentListView.swift    # List of comments for paragraph
    │   │       │   │   │
    │   │       │   │   ├── 📁 chapter-comments/        # Meso: Chapter-End Comments (本章说)
    │   │       │   │   │   ├── ChapterCommentsSectionView.swift  # Section at end of chapter
    │   │       │   │   │   ├── ChapterCommentThreadView.swift    # Threaded comment display
    │   │       │   │   │   ├── ChapterCommentFormView.swift       # Form to create chapter comment
    │   │       │   │   │   ├── CommentVotingView.swift            # Upvote/downvote component
    │   │       │   │   │   └── CommentSortSelectorView.swift      # Sort by time/popularity
    │   │       │   │   │
    │   │       │   │   ├── 📁 reviews/                 # Macro: Book Reviews
    │   │       │   │   │   ├── ReviewsSectionView.swift          # Reviews section on story page
    │   │       │   │   │   ├── ReviewCardView.swift               # Individual review card
    │   │       │   │   │   ├── ReviewFormView.swift              # Form to create review
    │   │       │   │   │   ├── ReviewRatingsView.swift           # Structured ratings (plot, characters, etc.)
    │   │       │   │   │   ├── ReviewHelpfulVotingView.swift     # Helpful/Not helpful voting
    │   │       │   │   │   └── FeaturedReviewsView.swift         # Featured reviews carousel
    │   │       │   │   │
    │   │       │   │   ├── 📁 forums/                  # Macro: Discussion Forums
    │   │       │   │   │   ├── ForumSectionView.swift            # Forum section on story page
    │   │       │   │   │   ├── ForumThreadListView.swift         # List of forum threads
    │   │       │   │   │   ├── ForumThreadCardView.swift         # Individual thread card
    │   │       │   │   │   ├── ForumThreadDetailView.swift       # Thread detail with posts
    │   │       │   │   │   ├── ForumPostThreadView.swift        # Threaded post display
    │   │       │   │   │   ├── ForumPostFormView.swift          # Form to create post
    │   │       │   │   │   ├── ForumCategorySelectorView.swift  # Category selector
    │   │       │   │   │   └── ForumModerationView.swift        # Moderation tools (pin, lock)
    │   │       │   │   │
    │   │       │   │   └── 📁 platform-interactions/  # Platform Interactions
    │   │       │   │       ├── 📁 polls/
    │   │       │   │       │   ├── PollCardView.swift            # Poll display card
    │   │       │   │       │   ├── PollVotingView.swift         # Poll voting interface
    │   │       │   │       │   ├── PollResultsView.swift        # Poll results display
    │   │       │   │       │   └── PollListView.swift           # List of polls
    │   │       │   │       │
    │   │       │   │       └── 📁 quizzes/
    │   │       │   │           ├── QuizCardView.swift           # Quiz display card
    │   │       │   │           ├── QuizInterfaceView.swift      # Quiz taking interface
    │   │       │   │           ├── QuizResultsView.swift        # Quiz results display
    │   │       │   │           ├── QuizLeaderboardView.swift    # Quiz leaderboard
    │   │       │   │           └── QuizListView.swift           # List of quizzes
    │   │       │   │
    │   │       │   ├── 📁 mobile/                       # Mobile-Specific Views (NEW)
    │   │       │   │   ├── 📁 bulk-operations/          # Bulk selection & actions
    │   │       │   │   │   ├── BulkSelectionView.swift      # Multi-select interface
    │   │       │   │   │   ├── BulkActionBar.swift          # Bulk action toolbar
    │   │       │   │   │   └── SelectionManager.swift       # Selection state manager
    │   │       │   │   │
    │   │       │   │   ├── 📁 export-import/            # Export/Import features
      │   │       │   │   │   ├── ExportView.swift             # Export library/annotations
      │   │       │   │   │   ├── ImportView.swift             # Import data
      │   │       │   │   │   ├── ScheduledExportView.swift    # Scheduled exports (NEW - from web)
      │   │       │   │   │   └── ExportHistoryView.swift      # Export history (NEW - from web)
    │   │       │   │   │   └── ShareSheetView.swift         # Share sheet integration
    │   │       │   │   │
      │   │       │   │   ├── 📁 advanced-search/          # Advanced search/filter
      │   │       │   │   │   ├── AdvancedSearchView.swift     # Complex search UI
      │   │       │   │   │   ├── SearchHistoryView.swift      # Search history (NEW - from web)
      │   │       │   │   │   ├── SearchSuggestionsView.swift  # Search suggestions (NEW - from web)
      │   │       │   │   │   └── FilterPresetsView.swift      # Filter presets (NEW - from web)
      │   │       │   │   │
      │   │       │   │   ├── 📁 command-palette/          # Command Palette (NEW - from web, mobile-optimized)
      │   │       │   │   │   ├── CommandPaletteView.swift     # Search overlay (swipe down to open)
      │   │       │   │   │   │   # - Native iOS search experience using UISearchController
      │   │       │   │   │   │   # - Swipe down gesture to open (iOS native)
      │   │       │   │   │   │   # - Search stories, chapters, annotations, settings
      │   │       │   │   │   │   # - Quick actions: Navigate, create, search
      │   │       │   │   │   │   # - Keyboard shortcuts hints (iPad with keyboard)
      │   │       │   │   │   └── CommandPaletteResults.swift # Search results list
      │   │       │   │   │       # - Categorized results (Stories, Chapters, Annotations, Settings)
      │   │       │   │   │       # - Tap to navigate or execute action
    │   │       │   │   │   ├── SavedFiltersView.swift       # Saved filter presets
    │   │       │   │   │   └── SearchBuilderView.swift      # Query builder UI
    │   │       │   │   │
    │   │       │   │   ├── 📁 reading-stats/            # Reading statistics
    │   │       │   │   │   ├── ReadingStatsView.swift       # Statistics dashboard
    │   │       │   │   │   ├── ReadingTimeChart.swift       # Reading time chart
    │   │       │   │   │   ├── WPMTracker.swift             # Words per minute tracker
    │   │       │   │   │   └── ProgressChart.swift          # Progress visualization
    │   │       │   │   │
    │   │       │   │   └── 📁 reader-enhanced/          # Enhanced reader features
    │   │       │   │       ├── MultiColumnReaderView.swift  # Multi-column reading (iPad)
    │   │       │   │       ├── ReaderSidebarView.swift      # Swipeable sidebar for notes
      │   │       │   │       ├── AdvancedAnnotationEditor.swift  # Rich text annotation editor
      │   │       │   │       ├── AnnotationTemplatesView.swift   # Annotation templates (NEW - from web)
      │   │       │   │       │   # - Save annotation templates (formatting, colors, tags)
      │   │       │   │       │   # - Quick apply templates to new annotations
      │   │       │   │       │   # - Template management UI
      │   │       │   │       ├── AnnotationSearchView.swift      # Search within annotations (NEW - from web)
      │   │       │   │       │   # - Search annotations by text, tags, dates
      │   │       │   │       │   # - Filter by story, chapter, annotation type
      │   │       │   │       │   # - Full-text search with highlighting
      │   │       │   │       └── AnnotationExportView.swift     # Export annotations (NEW - from web)
      │   │       │   │           # - Export annotations as Markdown, PDF
      │   │       │   │           # - Export to Notion, Obsidian, Capacities
      │   │       │   │           # - Batch export with format selection
    │   │       │   │       └── ReaderLayoutManager.swift     # Customizable layout presets
    │   │       │   │
    │   │       │   ├── 📁 monetization/              # Monetization Views (NEW)
    │   │       │   │   ├── WalletView.swift              # Wallet dashboard
    │   │       │   │   ├── TopUpView.swift               # Top-up wallet
    │   │       │   │   ├── TransactionHistoryView.swift  # Transaction history
    │   │       │   │   ├── PaywallView.swift             # Paywall banner
    │   │       │   │   ├── PurchaseDialogView.swift      # Purchase dialog
    │   │       │   │   ├── SubscriptionPlansView.swift   # Subscription plans
    │   │       │   │   └── SubscriptionManageView.swift  # Manage subscription
    │   │       │   │
    │   │       │   ├── 📁 fan-economy/              # Fan Economy Views (NEW)
    │   │       │   │   ├── TippingView.swift            # Tipping dialog
    │   │       │   │   ├── VotesView.swift              # Vote button & display
    │   │       │   │   ├── FanRankingsView.swift        # Fan rankings list
    │   │       │   │   └── AuthorSupportView.swift      # Author support stats
    │   │       │   │
    │   │       │   ├── 📁 ai/                        # AI Service Views (NEW)
    │   │       │   │   ├── TranslationView.swift         # Translation panel
    │   │       │   │   └── SummarizationView.swift       # Summary display
    │   │       │   │
    │   │       │   ├── 📁 notifications/            # Notification Views (NEW)
    │   │       │   │   ├── NotificationCenterView.swift  # Notification center
    │   │       │   │   └── NotificationSettingsView.swift # Notification settings
    │   │       │   │
    │   │       │   └── Settings/
    │   │       │       ├── TTSSettingsView.swift        # TTS engine selection
    │   │       │       ├── ReadingPreferencesView.swift # Reading settings
    │   │       │       └── LayoutSettingsView.swift     # Layout preferences (NEW)
    │   │       │
    │   │       ├── 📁 Service/                          # Services Layer
    │   │       │   ├── GraphQLService.swift             # Apollo Client (calls 1-gateway GraphQL)
    │   │       │   │   │                                  # - **Monetization Queries/Mutations:** ⭐
    │   │       │   │   │                                  #   * getWalletBalance() → Query: getBalance()
    │   │       │   │   │                                  #   * topUpWallet(amount) → Mutation: topUp()
    │   │       │   │   │                                  #   * getTransactionHistory() → Query: getTransactionHistory()
    │   │       │   │   │                                  #   * purchaseChapter(chapterId) → Mutation: purchaseChapter()
    │   │       │   │   │                                  #   * purchaseBulk(chapterIds) → Mutation: purchaseBulk()
    │   │       │   │   │                                  #   * getPurchaseHistory() → Query: getPurchaseHistory()
    │   │       │   │   │                                  #   * getSubscriptionPlans() → Query: getMembership()
    │   │       │   │   │                                  #   * subscribe(planId) → Mutation: createMembership()
    │   │       │   │   │                                  #   * getSubscriptionStatus() → Query: getMembership()
    │   │       │   │   │                                  #   * cancelSubscription() → Mutation: cancelMembership()
    │   │       │   │   │                                  #   * purchasePrivilege(storyId) → Mutation: purchasePrivilege()
    │   │       │   │   │                                  #   * getPrivilege(storyId) → Query: getPrivilege()
    │   │       │   │   │                                  #   * getAdvancedChapters(storyId) → Query: getAdvancedChapters()
    │   │       │   │   │                                  # - **Community Queries/Mutations:** ⭐
    │   │       │   │   │                                  #   * createParagraphComment(chapterId, paragraphIndex, content, reactionType?) → Mutation: createParagraphComment()
    │   │       │   │   │                                  #   * getParagraphComments(chapterId, paragraphIndex?) → Query: getParagraphComments()
    │   │       │   │   │                                  #   * getParagraphCommentCounts(chapterId) → Query: getParagraphCommentCounts()
    │   │       │   │   │                                  #   * likeParagraphComment(commentId) → Mutation: likeParagraphComment()
    │   │       │   │   │                                  #   * replyToParagraphComment(commentId, content) → Mutation: replyToParagraphComment()
    │   │       │   │   │                                  #   * createTip(storyId, amount, message?) → Mutation: createTip()
    │   │       │   │   │                                  #   * getFanRankings(storyId?, authorId?) → Query: getFanRankings()
    │   │       │   │   │                                  #   * castMonthlyVote(storyId, votes) → Mutation: castMonthlyVote()
    │   │       │   │   │                                  #   * createChapterComment(chapterId, content) → Mutation: createChapterComment()
    │   │       │   │   │                                  #   * createReview(storyId, rating, content) → Mutation: createReview()
    │   │       │   │   │                                  #   * votePoll(pollId, optionId) → Mutation: votePoll()
    │   │       │   ├── WebSocketService.swift           # Socket.IO client (websocket-service)
    │   │       │   │   │                                  # - **WebSocket Subscriptions:** ⭐
    │   │       │   │   │                                  #   * subscribe("paragraph-comments:\(chapterId)") → Real-time paragraph comment updates
    │   │       │   │   │                                  #   * subscribe("wallet:\(userId)") → Real-time wallet balance updates
    │   │       │   │   │                                  #   * subscribe("purchases:\(userId)") → Real-time purchase confirmations
    │   │       │   │   │                                  #   * Events: paragraph.comment.created, purchase.completed, wallet.balance.updated
    │   │       │   ├── OfflineService.swift             # Core Data (offline storage - Metadata Database)
    │   │       │   │   │                                  # - Stores metadata only (stories, chapters, library, progress)
    │   │       │   │   │                                  # - NO BLOBs (large text content) - keeps DB fast
    │   │       │   │   │                                  # - Relationships: stories, authors, genres, library items
    │   │       │   │   │                                  # - Optimized for complex queries and large datasets
    │   │       │   ├── ContentStorageService.swift      # Content Storage (NEW - MVP Phase 1)
    │   │       │   │   │                                  # - Downloads and stores chapter files in App-Specific Storage
    │   │       │   │   │                                  # - Uses FileManager to access getFilesDir() equivalent
    │   │       │   │   │                                  # - Separates metadata (Core Data) from content (files)
    │   │       │   │   │                                  # - Manages file paths, download queue, storage cleanup
    │   │       │   ├── ContentEncryptionService.swift   # Data-at-Rest Encryption (NEW - MVP Phase 1)
    │   │       │   │   │                                  # - Encrypts chapter files using AES encryption
    │   │       │   │   │                                  # - Uses encrypt package (AES-256)
    │   │       │   │   │                                  # - Key management: device-specific keys stored in Keychain
    │   │       │   │   │                                  # - DRM Layer 2: Prevents bulk content extraction
    │   │       │   │   │                                  # - Encrypts on write, decrypts on read
    │   │       │   ├── SyncService.swift                # Enhanced Sync Service (NEW - MVP Phase 1)
    │   │       │   │   │                                  # - Syncs local state (progress, bookmarks) with backend
    │   │       │   │   │                                  # - Conflict resolution: Last-write-wins with timestamp comparison
    │   │       │   │   │                                  # - Sync queue: Processes pending updates when online
    │   │       │   │   │                                  # - Handles network failures gracefully
    │   │       │   │   │                                  # - Syncs: Library, Progress, Bookmarks, Annotations, Preferences
    │   │       │   │
    │   │       │   └── 📁 TTS/                          # TTS Module
    │   │       │       ├── TTSEngine.swift               # TTS protocol/interface
    │   │       │       ├── NativeTTSEngine.swift         # AVSpeechSynthesizer (iOS native)
    │   │       │       ├── EmbeddedTTSEngine.swift       # Proprietary SDK (60MB, high quality)
    │   │       │       └── TextToSpeechManager.swift     # TTS manager (delegates to engines)
    │   │       │
    │   │       ├── 📁 Repository/                       # Repository Pattern (Rule #8 - Offline-First)
    │   │       │   ├── StoryRepository.swift             # Decides: GraphQLService or OfflineService
    │   │       │   │   │                                  # - **Offline-First:** Load from Core Data first (instant UI)
    │   │       │   │   │                                  # - Then fetch from network in background
    │   │       │   │   │                                  # - Coordinates: OfflineService (metadata) + ContentStorageService (content)
    │   │       │   ├── ChapterRepository.swift            # Chapter Repository (NEW - MVP Phase 1)
    │   │       │   │   │                                  # - Loads chapter metadata from Core Data
    │   │       │   │   │                                  # - Loads chapter content from ContentStorageService (encrypted files)
    │   │       │   │   │                                  # - Decrypts content on-the-fly when reading
    │   │       │   │   │                                  # - Downloads missing chapters in background
      │   │       │   ├── LibraryRepository.swift           # Library sync logic (Enhanced - 2.1, 2.2, 2.3)
      │   │       │   ├── BookshelfRepository.swift         # Bookshelf sync logic (Enhanced - 2.1)
      │   │       │   ├── TagRepository.swift                # Tag sync logic (NEW - 2.1)
      │   │       │   ├── FilteredViewRepository.swift       # Filtered view sync logic (NEW - 2.1)
      │   │       │   ├── DownloadRepository.swift           # Download management (NEW - 2.2)
      │   │       │   ├── BookmarkSyncRepository.swift       # Bookmark sync (NEW - 2.3)
      │   │       │   └── AnnotationSyncRepository.swift      # Annotation sync (NEW - 2.3)
    │   │       │   ├── WishlistRepository.swift          # Wishlist sync logic (NEW)
    │   │       │   ├── FeedRepository.swift              # Feed aggregation
    │   │       │   ├── ReadingProgressRepository.swift   # Progress sync (Enhanced - Cross-device sync)
    │   │       │   ├── ReadingPreferencesRepository.swift  # Reading preferences sync (NEW - Critical for sync)
    │   │       │   ├── BookmarkRepository.swift          # Bookmark sync logic (NEW)
    │   │       │   ├── AnnotationRepository.swift        # Annotation sync logic (NEW)
    │   │       │   └── SyncManager.swift                 # Main sync orchestrator (NEW - Cross-device sync)
    │   │       │   ├── DiscoveryRepository.swift         # Discovery & Rankings (NEW)
    │   │       │   ├── RecommendationsRepository.swift  # Recommendations (NEW)
    │   │       │   ├── CommunityRepository.swift         # Community interactions (NEW)
    │   │       │   ├── ExportImportRepository.swift      # Export/Import logic (NEW)
    │   │       │   ├── SearchRepository.swift            # Advanced search logic (NEW)
    │   │       │   ├── ReadingStatsRepository.swift      # Reading statistics (NEW)
    │   │       │   ├── WalletRepository.swift            # Wallet & Payments (NEW)
    │   │       │   ├── PaywallRepository.swift           # Paywall logic (NEW)
    │   │       │   ├── SubscriptionRepository.swift      # Subscription logic (NEW)
    │   │       │   ├── TippingRepository.swift           # Tipping logic (NEW)
    │   │       │   ├── VotesRepository.swift             # Votes logic (NEW)
    │   │       │   ├── TranslationRepository.swift       # Translation logic (NEW)
    │   │       │   ├── SummarizationRepository.swift     # Summarization logic (NEW)
    │   │       │   └── NotificationsRepository.swift     # Notifications logic (NEW)
    │   │       │
    │   │       └── 📁 Utilities/                        # Utilities
    │   │           ├── CombineExtensions.swift           # Combine helpers
    │   │           ├── CoreDataStack.swift               # Core Data setup (Metadata Database)
    │   │           │   │                                  # - SQLite backend (via Core Data)
    │   │           │   │                                  # - Stores metadata only (NO BLOBs)
    │   │           │   │                                  # - Optimized for complex relationships
    │   │           ├── NetworkMonitor.swift              # Network status
    │   │           ├── FileStorageManager.swift         # File Storage Manager (NEW - MVP Phase 1)
    │   │           │   │                                  # - Manages App-Specific Storage directory
    │   │           │   │                                  # - Uses FileManager.default.urls(for: .documentDirectory)
    │   │           │   │                                  # - Creates organized folder structure for chapters
    │   │           │   │                                  # - Handles file cleanup and storage management
    │   │           ├── EncryptionKeyManager.swift        # Encryption Key Manager (NEW - MVP Phase 1)
    │   │           │   │                                  # - Manages AES encryption keys
    │   │           │   │                                  # - Stores keys in iOS Keychain (secure storage)
    │   │           │   │                                  # - Generates device-specific keys
    │   │           │   │                                  # - Key rotation support
    │   │           │
    │   │           └── 📁 mobile/                       # Mobile-Specific Utilities (NEW)
      │   │               ├── 📁 export/                    # Export utilities
      │   │               │   ├── ExportManager.swift           # Export library/annotations
      │   │               │   ├── ExportFormatter.swift         # Format converters (JSON, CSV, Markdown)
      │   │               │   ├── ScheduledExportManager.swift  # Scheduled exports (NEW - from web)
      │   │               │   │   # - Background task scheduling using BGTaskScheduler
      │   │               │   │   # - Auto-export on schedule (daily, weekly)
      │   │               │   │   # - Configurable export scope and format
      │   │               │   ├── ExportHistoryManager.swift    # Export history tracking (NEW - from web)
      │   │               │   │   # - Track all exports with timestamps, format, scope
      │   │               │   │   # - Store in Core Data for persistence
      │   │               │   │   # - View export history with filters
      │   │               │   └── ShareSheetManager.swift       # Share sheet integration
    │   │               │
    │   │               ├── 📁 import/                    # Import utilities
    │   │               │   ├── ImportManager.swift           # Import library from file
    │   │               │   ├── ImportValidator.swift         # Validates import data
    │   │               │   └── ImportMapper.swift            # Maps imported data to app format
    │   │               │
      │   │               ├── 📁 search/                    # Advanced search
      │   │               │   ├── SearchHistoryManager.swift     # Search history (NEW - from web)
      │   │               │   │   # - Track recent searches with timestamps
      │   │               │   │   # - Store in Core Data, limit to last 50 searches
      │   │               │   │   # - Quick access from search bar
      │   │               │   ├── SearchSuggestionsManager.swift # Search suggestions (NEW - from web)
      │   │               │   │   # - Auto-complete based on search history
      │   │               │   │   # - Prioritize recent and popular queries
      │   │               │   │   # - Real-time suggestions as user types
      │   │               │   └── FilterPresetsManager.swift     # Filter presets (NEW - from web)
      │   │               │       # - Save frequently used filter combinations
      │   │               │       # - Named presets with quick access
      │   │               │       # - Store in Core Data for persistence
    │   │               │   ├── SearchIndexManager.swift      # CoreSpotlight integration
    │   │               │   ├── QueryBuilder.swift            # Builds complex search queries
    │   │               │   ├── FilterEngine.swift            # Advanced filtering logic
    │   │               │   └── SavedFiltersManager.swift     # Saved filter management
    │   │               │
    │   │               ├── 📁 stats/                     # Reading statistics
    │   │               │   ├── ReadingStatsCalculator.swift  # Calculates WPM, reading time
    │   │               │   ├── StatsStorage.swift            # Stores statistics
    │   │               │   └── StatsAggregator.swift         # Aggregates statistics
    │   │               │
    │   │               ├── 📁 bulk/                      # Bulk operations
    │   │               │   ├── BulkOperationManager.swift    # Manages bulk operations
    │   │               │   └── SelectionStateManager.swift   # Manages selection state
    │   │               │
    │   │               └── 📁 haptics/                   # Haptic feedback
    │   │                   └── HapticManager.swift           # Haptic feedback manager
    │   │
    │   ├── 📁 Configuration Files
    │   │   ├── TruyenApp.xcodeproj                      # Xcode project
    │   │   ├── Info.plist                              # App configuration
    │   │   └── Entitlements.plist                      # App capabilities
    │   │
    │   └── 📁 Test Files
    │       └── test/
    │           ├── unit/                               # Unit tests
    │           └── ui/                                  # UI tests
    │
    │   📝 **Development Steps:**
    │   │       1.  Create `Model/` (structs) based on `7-shared/` (requires manual translation or type generation), including new `Post`, `Group` models.
    │   │       2.  Create `Service/GraphQLService.swift` (using **Apollo iOS Client**) to call the **GraphQL API** from `1-gateway` (including new social queries/mutations).
    │   │       3.  **Metadata Database (Core Data - MVP Phase 1):**
    │   │           - Create `Service/OfflineService.swift` (using `Core Data` with SQLite backend)
    │   │           - **CRITICAL:** Store metadata ONLY (stories, chapters, library, progress, bookmarks, annotations)
    │   │           - **NO BLOBs:** Do NOT store chapter text content in Core Data
    │   │           - Optimize for complex relationships (stories → authors → genres)
    │   │           - Handle large datasets (millions of library records)
    │   │           - Create Core Data entities: `StoryEntity`, `ChapterMetadataEntity`, `LibraryEntity`, `ReadingProgressEntity`, etc.
    │   │           - `ChapterMetadataEntity` should reference content file path, NOT content itself
    │   │       4.  **Content Storage (MVP Phase 1):**
    │   │           - Create `Service/ContentStorageService.swift`:
    │   │             * Downloads chapter files from backend
    │   │             * Stores files in App-Specific Storage (using `FileManager.default.urls(for: .documentDirectory)`)
    │   │             * Creates organized folder structure: `Documents/Chapters/{storyId}/{chapterId}.encrypted`
    │   │             * Manages download queue and progress tracking
    │   │             * Handles storage cleanup (old downloads, storage limits)
    │   │           - Create `Utilities/FileStorageManager.swift`:
    │   │             * Manages file paths and directory structure
    │   │             * Provides file existence checks
    │   │             * Handles file deletion and cleanup
    │   │       5.  **Data-at-Rest Encryption (MVP Phase 1):**
    │   │           - Create `Service/ContentEncryptionService.swift`:
    │   │             * Encrypts chapter files using AES-256 encryption
    │   │             * Uses `CryptoKit` framework (iOS native) or `encrypt` package
    │   │             * Encrypts files before writing to disk
    │   │             * Decrypts files when reading for display
    │   │           - Create `Utilities/EncryptionKeyManager.swift`:
    │   │             * Manages encryption keys in iOS Keychain (secure storage)
    │   │             * Generates device-specific keys on first launch
    │   │             * Supports key rotation if needed
    │   │             * Uses `KeychainAccess` or native `Security` framework
    │   │       6.  **Enhanced Sync Service (MVP Phase 1):**
    │   │           - Create `Service/SyncService.swift`:
    │   │             * Syncs local state (from Core Data) with backend (via GraphQL)
    │   │             * Implements conflict resolution: Last-write-wins (timestamp comparison)
    │   │             * Maintains sync queue for pending updates (when offline)
    │   │             * Processes sync queue when network becomes available
    │   │             * Handles sync failures gracefully (retry logic)
    │   │             * Syncs: Library, Reading Progress, Bookmarks, Annotations, Preferences
    │   │             * Emits sync status events for UI updates
    │   │       7.  Create a `Repository` (Rule #8) (using `Combine` publishers) to decide whether to fetch from `GraphQLService` or `OfflineService`, including feed logic.
    │   │           - **Offline-First Pattern:** Always load from Core Data first (instant UI)
    │   │           - Then fetch from network in background and update Core Data
    │   │           - Repository coordinates between `OfflineService`, `ContentStorageService`, and `GraphQLService`
    │   │           - **ChapterRepository (NEW - MVP Phase 1):**
    │   │             * Loads chapter metadata from Core Data (instant)
    │   │             * Loads chapter content from ContentStorageService (encrypted file)
    │   │             * Decrypts content on-the-fly using ContentEncryptionService
    │   │             * Downloads missing chapters in background via ContentStorageService
    │   │             * Updates Core Data metadata when download completes
    │   │       5.  Create `ViewModel/` (MVVM, using `@Published` properties) to call the `Repository` and prepare data for the UI.
    │   │       6.  Create `View/` (SwiftUI) to display data from the `ViewModel`.
    │   │       7.  **New Social Features:**
    │   │           - Update `GraphQLService.swift` with social queries: `feedQuery`, `createPostMutation`, `followUserMutation`, `joinGroupMutation`.
    │   │           - Update `OfflineService.swift` Core Data models: `PostEntity`, `GroupEntity`, `FollowEntity`.
    │   │           - Create new ViewModels: `FeedViewModel`, `GroupViewModel`, `PostViewModel`.
    │   │           - Create new SwiftUI Views: `FeedView.swift`, `GroupListView.swift`, `GroupDetailView.swift`, `PostCardView.swift`.
        │   │       8.  **Reader Interface (Core Reading Experience - Based on Qidian/QQ Reading):**
        │   │           
        │   │           **1.1. Giao diện Đọc (UI) và Tùy chỉnh Người dùng:**
        │   │           
        │   │           **A. Kích hoạt Menu (Tap to Toggle Controls):**
        │   │           - Tap center of screen to show/hide top/bottom control bars
        │   │           - Implement in `StoryReaderView.swift`:
        │   │             - Use `TapGesture` on main content area
        │   │             - State: `@State private var showControls: Bool`
        │   │             - Auto-hide timer: `Timer` with `controlsTimeout` (default: 3000ms)
        │   │             - Controlled by `tapToToggleControls` and `autoHideControls` from ReadingPreferences
        │   │           
        │   │           **B. Chế độ Nền (Background Modes):**
        │   │           - Toggle via moon/sun icon in bottom controls
        │   │           - Implement in `ReadingPreferencesView.swift`:
        │   │             - Options: 'white' (Day), 'black' (Night), 'sepia', 'eye-protection' (护眼模式), 'custom'
        │   │             - Eye protection: Yellow/green tint using `Color.yellow.opacity(0.1)` overlay
        │   │             - Custom: Color picker using `ColorPicker` (iOS 14+)
        │   │             - Apply via SwiftUI: `.background()` modifier with color from preferences
        │   │             - **Brightness:** Use `UIScreen.main.brightness` (app-only, requires permission)
             - **Brightness Sync (CRITICAL):** 
               * Brightness preference (0-100) must sync across devices via `ReadingPreferencesRepository.swift`
               * Web/desktop applies via CSS brightness filter
               * Mobile applies via system brightness API (if available) or overlay
               * User expects consistent brightness experience across devices
        │   │           
        │   │           **C. Kích thước Văn bản (Font Size):**
        │   │           - Access via 'Aa' icon in bottom menu
        │   │           - Implement in `ReadingPreferencesView.swift`:
        │   │             - `Slider` control: 12-24px range (default: 16px)
        │   │             - Real-time preview: Update `@State` as user adjusts
        │   │             - Apply via SwiftUI: `.font(.system(size: CGFloat(preferences.fontSize)))`
        │   │             - **Sync via Repository (CRITICAL - Cross-device sync):** 
               * Save to Core Data instantly (offline-first)
               * Sync to backend when online via `ReadingPreferencesRepository.swift`
               * Backend syncs to all other devices (web, Android, desktop) via WebSocket events
               * Other devices receive real-time updates and update their local preferences
               * User expects same font size on all devices - sync is MANDATORY
        │   │           
        │   │           **D. Chế độ Đọc (Scroll vs Page Turn):**
        │   │           - Critical: Two distinct reading habits (users strongly prefer one or the other)
        │   │           - Implement in `StoryReaderView.swift`:
        │   │             - **Scroll Mode** (arrow up/down icon):
        │   │               - Use `ScrollView` with `.scrollTargetBehavior(.paging)` (iOS 17+)
        │   │               - Or `ScrollViewReader` for manual scroll tracking
        │   │               - Track scroll position: `scrollPosition` binding
        │   │               - Calculate reading progress from scroll offset
        │   │             - **Page Turn Mode** (arrow left/right icon):
        │   │               - Use `TabView` with `.tabViewStyle(.page)` for horizontal paging
        │   │               - Or custom `DragGesture` for swipe-to-turn
        │   │               - Page turn animation: `withAnimation(.easeInOut)` for smooth transitions
        │   │               - Calculate pages: Divide content height by viewport height
        │   │               - Track current page: `@State private var currentPage: Int`
        │   │           - Toggle in `ReaderControlsView.swift`:
        │   │             - Two `Button`s: scroll (↑↓) and page (←→) with SF Symbols
        │   │             - Active mode: Highlighted with `.foregroundColor(.blue)`
        │   │             - **Update via Repository (CRITICAL - Cross-device sync):**
               * Save to Core Data instantly (offline-first)
               * Sync to backend when online via `ReadingPreferencesRepository.swift`
               * Backend syncs to all other devices (web, Android, desktop) via WebSocket events
               * Reading mode preference must sync - user expects same mode (scroll/page) on all devices
        │   │           
        │   │           **E. Implementation Details:**
        │   │           - **MVVM Pattern (Rule #5):**
        │   │             - ViewModel: `StoryReaderViewModel` manages preferences state
        │   │             - Repository: `ReadingPreferencesRepository` handles sync (local Core Data + backend)
        │   │             - View: `StoryReaderView` displays content and handles gestures
        │   │           - **Offline-First (Rule #8):**
        │   │             - Load preferences from Core Data instantly
        │   │             - Sync to backend in background
        │   │             - Handle conflicts: Local wins, merge on next sync
        │   │           - **Types (Rule #3):**
        │   │             - Import `ReadingPreferences` from `7-shared` (via generated types or manual translation)
        │   │           - **State Management:**
        │   │             - Server state: Repository pattern (Core Data + GraphQL sync)
        │   │             - UI state: `@State` and `@Binding` in SwiftUI views
        │   │           
        │   │           **F. Rules Compliance:**
        │   │           - Rule #3: Use `ReadingPreferences` type from `7-shared`
        │   │           - Rule #5: MVVM + Repository Pattern (mandatory for mobile)
        │   │           - Rule #8: Offline-first (load from Core Data first, sync in background)
    │   │           - **Content Interaction:**
    │   │             * **TTS/Narration (Enhanced):**
    │   │               - High-quality AI narration (free for ALL books)
    │   │               - Human narration (premium, for selected stories)
    │   │               - Speed control (0.5x - 2.0x), voice selection
    │   │               - Use `TextToSpeechManager` (see step 8 below)
    │   │               - Background playback, auto-play next chapter
    │   │             * **Dictionary (Enhanced - Pop-up):**
    │   │               - Trung-Anh dictionary with pronunciation & pinyin (for Chinese)
    │   │               - Pronunciation audio playback
    │   │               - Example sentences, related words, synonyms
    │   │               - Dictionary popup appears on word selection/click
    │   │             * **Translation (Enhanced):**
    │   │               - Auto-translate selected text or entire chapter
    │   │               - Context-aware translation (preserves story context)
    │   │               - Multiple language pairs support
    │   │               - Translation panel with batch translation
    │   │             * **Bookmarks:** Save reading positions, implement in annotation tools
    │   │             * **Annotations:** Text highlights + notes, implement in annotation tools
    │   │             * **Copy Protection (DRM - Rule #27):**
    │   │               - Block copy-paste for paid content (even if purchased)
    │   │               - Disable text selection for paid chapters
    │   │               - Use native flags to attempt blocking screenshots (not 100% reliable)
    │   │               - Balance: TTS provides audio access while blocking text access
    │   │           - **Library & Bookshelf Management (Enhanced - Core Feature with Cross-Device Sync):**
    │   │             * **Synchronization (CRITICAL - Rule #8):**
    │   │               - **Cross-device sync:** All data must sync seamlessly across web, mobile (iOS/Android), desktop
    │   │               - **Sync scope:** Library items, bookshelves, wishlist, reading progress, bookmarks, annotations, reading preferences
    │   │               - **Sync strategy:** Last-write-wins with timestamp comparison (same as backend)
    │   │               - **Offline-first (Rule #8):** Load from Core Data instantly, sync to backend in background
    │   │               - **Auto-sync:** Automatically sync on app start, when coming online, periodically in background
    │   │               - **Manual sync:** "Sync Now" button for manual sync trigger
    │   │               - **Real-time sync:** Listen to WebSocket events for real-time updates from other devices
    │   │               - **Conflict resolution:** Last-write-wins (newer timestamp wins), show conflict dialog if needed
    │   │               - **Sync status:** Show sync status indicator (synced, syncing, conflict, error)
    │   │               - **Implementation:** Use `SyncManager.swift` to orchestrate all syncs, each Repository handles its own sync logic
    │   │               - **Reading Preferences Sync (CRITICAL):** Must sync background mode, font size, reading mode, brightness across all devices
    │   │                 * When user changes preferences on Device A, it syncs to Device B immediately
    │   │                 * User expects same reading experience on all devices
    │   │                 * Store in Core Data, sync via `ReadingPreferencesRepository.swift`
    │   │             * **Organization:**
    │   │               - **Virtual Bookshelves:** Create multiple bookshelves to organize stories, implement in `BookshelfView.swift`
    │   │               - **Custom Tags:** Add custom tags to library items, implement tag management UI
    │   │               - **Layouts:** Toggle between grid/list view, preferences synced across devices
    │   │               - **Sorting:** Sort by recent, title, progress, added date
    │   │               - **Filtering:** Filter by bookshelf, tags, completion status
    │   │               - **Search:** Search library by title or tags
    │   │             * **Offline Download (Mobile-Specific):**
    │   │               - Download stories/chapters for offline reading, implement download manager with Core Data storage
    │   │               - Premium chapters only downloaded if user has unlocked them
    │   │               - Download progress tracking, cancel download, delete downloaded content
    │   │               - Note: Downloaded content is device-local, but download status syncs across devices
    │   │             * **Tracking:**
    │   │               - Reading progress (chapter, position, WPM), wishlist, implement in `ReadingProgressRepository.swift`
    │   │               - Reading statistics, progress history, completion tracking
    │   │       9.  **TTS (Text-to-Speech) Features:**
    │   │           - Create `Service/TTS/` directory to organize TTS logic.
    │   │           - Create `TTSEngine.swift` (Protocol) defining TTS interface.
    │   │           - Create `NativeTTSEngine.swift` (using `AVSpeechSynthesizer` for iOS native TTS).
    │   │           - Create `EmbeddedTTSEngine.swift` (using proprietary 60MB SDK for high-quality voices).
    │   │           - Create `TextToSpeechManager.swift` (main manager class that reads user settings and delegates to appropriate engine).
    │   │           - Create `SettingsViewModel.swift` to manage TTS settings.
    │   │           - Create `View/Settings/TTSSettingsView.swift` (UI for users to choose TTS engine and voice).
    │   │           - Update `StoryReaderViewModel.swift` to use `TextToSpeechManager` instead of direct TTS calls.
    │   │       10. **Discovery & Engagement Features (NEW):**
    │   │           - Create `Repository/DiscoveryRepository.swift`:
    │   │             * `getRankings(rankingType, genre?, timeRange?)` -> GraphQL query
    │   │             * `getEditorPicks(limit?, genre?)` -> GraphQL query
    │   │             * `getGenreStories(genre, page?, limit?)` -> GraphQL query
    │   │             * Offline cache in Core Data
    │   │           - Create `ViewModel/StorefrontViewModel.swift` and `RankingsViewModel.swift`
    │   │           - Create `View/StorefrontView.swift` and `RankingsView.swift`
    │   │       11. **Recommendation Engine Integration (NEW):**
    │   │           - Create `Repository/RecommendationsRepository.swift`:
    │   │             * `getRecommendations(userId, limit?)` -> GraphQL query
    │   │             * `getSimilarStories(storyId, limit?)` -> GraphQL query
    │   │             * Cache recommendations in Core Data
    │   │           - Create `ViewModel/RecommendationsViewModel.swift`
    │   │           - Create `View/RecommendationsView.swift`
    │   │           - Track user behavior (clicks, reading time) for recommendations
    │   │       12. **Community Interactions (NEW):** 🎯 **KILLER FEATURE - Duanping**
    │   │           - **Micro Level - Paragraph Comments (Duanping):** 🎯
    │   │             * **Repository:** `Repository/CommunityRepository.swift`
    │   │               - Methods: `createParagraphComment()`, `getParagraphComments()`, `getParagraphCommentCounts()`, `likeParagraphComment()`, `replyToParagraphComment()`
    │   │               - WebSocket: Subscribe to `paragraph-comments:${chapterId}` for real-time updates
    │   │             * **ViewModel:** `ViewModel/ParagraphCommentsViewModel.swift`
    │   │               - State: comments, commentCounts (map of paragraphIndex -> count)
    │   │               - Methods: createComment, likeComment, replyToComment, deleteComment
    │   │               - Real-time: Updates state when WebSocket events received
    │   │             * **Views:**
    │   │               - `ParagraphCommentBubbleView.swift`: Bubble indicator on paragraph
    │   │                 * Position: Overlay on right side of paragraph
    │   │                 * Display: Comment count badge (e.g., "58")
    │   │                 * Real-time: Updates count via WebSocket
    │   │               - `ParagraphCommentPanelView.swift`: Panel showing all comments
    │   │                 * Opens when bubble tapped (sheet or navigation)
    │   │                 * Shows: Comment list, author interactions, quick reactions
    │   │               - `QuickReactionButtonsView.swift`: Quick reaction buttons
    │   │                 * Predefined reactions: 'like', 'laugh', 'cry', 'angry', 'wow', 'love'
    │   │               - `ParagraphCommentListView.swift`: List of comments
    │   │                 * Sorted by: newest first, most liked first
    │   │                 * Shows: User avatar, content, reaction type, like count, author badges
    │   │             * **Integration into Reader:**
    │   │               - Overlay comment bubbles on paragraphs in `ReaderContentView`
    │   │               - Tap bubble to open `ParagraphCommentPanelView`
    │   │               - Lazy load: Only fetch comments for visible paragraphs
    │   │               - Real-time updates via WebSocket
    │   │           - **Meso Level - Chapter Comments:**
    │   │             * Repository methods: `createChapterComment()`, `getChapterComments()`, `voteComment()`, `replyToComment()`
    │   │             * View: `ChapterCommentsSectionView.swift` at end of chapter
    │   │           - **Macro Level - Reviews & Forums:**
    │   │             * Repository methods: `createReview()`, `getReviews()`, `createForumPost()`, `getForumPosts()`
    │   │             * Views: `ReviewsSectionView.swift`, `ForumSectionView.swift` on story detail page
    │   │           - **Platform Interactions - Polls & Quizzes:**
    │   │             * Repository methods: `createPoll()`, `votePoll()`, `createQuiz()`, `submitQuiz()`
    │   │             * Views: `PollCardView.swift`, `QuizCardView.swift` on story/home pages
    │   │       13. **Mobile-Specific Features (NEW):**
    │   │           - **Bulk Operations:**
    │   │             * Create `ViewModel/BulkOperationsViewModel.swift`
    │   │             * Create `View/mobile/bulk-operations/` components
    │   │             * Implement multi-select with checkboxes, batch actions (delete, move, tag)
          │   │           - **Export/Import (Enhanced - from web):**
          │   │             * Create `Repository/ExportImportRepository.swift`
          │   │             * Create `Utilities/mobile/export/` and `import/` utilities
          │   │             * Implement Share Sheet integration for export
          │   │             * Support JSON, CSV, Markdown formats
          │   │             * **Scheduled Exports:** Auto-export on schedule (daily, weekly) (NEW - from web)
          │   │               - `Utilities/mobile/export/ScheduledExportManager.swift` registers BGTaskScheduler (`com.storyreader.scheduled.export`), persists user schedule, and triggers `ExportImportRepository` jobs.
          │   │               - `View/mobile/export-import/ScheduledExportView.swift` lets the user configure frequency (daily/weekly/monthly), scope flags, and next run time (per-user) while surfacing current schedule metadata.
          │   │               - `App/StoryReaderApp.swift` registers the background task on launch and re-schedules tasks whenever the scene moves to background.
          │   │             * **Export History:** Track export history (NEW - from web)
          │   │               - Create `Utilities/mobile/export/ExportHistoryManager.swift`
          │   │               - Create `View/mobile/export-import/ExportHistoryView.swift`
          │   │               - Store export records in Core Data
          │   │           - **Advanced Search/Filter (Enhanced - from web):**
          │   │             * Create `Repository/SearchRepository.swift`
          │   │             * Create `Utilities/mobile/search/` with CoreSpotlight integration
          │   │             * Create `View/mobile/advanced-search/` components
          │   │             * Implement saved filters, complex query builder
          │   │             * **Search History:** Track recent searches, quick access (NEW - from web)
          │   │               - Create `Utilities/mobile/search/SearchHistoryManager.swift`
          │   │               - Create `View/mobile/advanced-search/SearchHistoryView.swift`
          │   │               - Store search history in Core Data with timestamps
          │   │             * **Search Suggestions:** Auto-complete based on search history (NEW - from web)
          │   │               - Create `Utilities/mobile/search/SearchSuggestionsManager.swift`
          │   │               - Real-time suggestions as user types
          │   │               - Prioritize recent searches and popular queries
          │   │             * **Filter Presets:** Save frequently used filter combinations (NEW - from web)
          │   │               - Create `Utilities/mobile/search/FilterPresetsManager.swift`
          │   │               - Create `View/mobile/advanced-search/FilterPresetsView.swift`
          │   │               - Save/load filter presets with names
          │   │           - **Command Palette (NEW - from web, mobile-optimized):**
          │   │             * Swipe down from top to open search overlay (iOS native gesture)
          │   │             * Search stories, chapters, annotations, settings
          │   │             * Quick actions: Navigate, create, search
          │   │             * Keyboard shortcuts hints (for iPad with keyboard)
          │   │             * Create `ViewModel/CommandPaletteViewModel.swift`
          │   │             * Create `View/mobile/command-palette/CommandPaletteView.swift`
          │   │             * Create `View/mobile/command-palette/CommandPaletteResults.swift`
          │   │             * Integration: Use `UISearchController` for native iOS search experience
    │   │           - **Reading Statistics:**
    │   │             * Create `Repository/ReadingStatsRepository.swift`
    │   │             * Create `Utilities/mobile/stats/` for WPM calculation, time tracking
    │   │             * Create `View/mobile/reading-stats/` with charts
          │   │           - **Enhanced Reader Features (Enhanced - from web):**
          │   │             * Multi-column reading view for iPad
          │   │             * Swipeable sidebar for notes/bookmarks
          │   │             * Advanced annotation editor with rich text
          │   │             * **Annotation Templates:** Save annotation templates for quick use (NEW - from web)
          │   │             * **Annotation Search:** Search within annotations (text, tags, dates) (NEW - from web)
          │   │             * **Annotation Export:** Export annotations as Markdown, PDF (NEW - from web)
    │   │             * Customizable layout presets
    │   │           - **Haptic Feedback:**
    │   │             * Create `Utilities/mobile/haptics/HapticManager.swift`
    │   │             * Add haptic feedback to key interactions (page turn, selection, etc.)
    │   │           - **Widget Support:**
    │   │             * Create Widget Extension for Home screen widgets
    │   │             * Display reading progress, recent stories
    │   │           - **Shortcuts Integration:**
    │   │             * Create Siri Shortcuts for quick actions (continue reading, open library)
    │   │           - **Share Extensions:**
    │   │             * Create Share Extension to import content from other apps
    │   │       14. **Monetization Features (NEW):**
    │   │           - **Virtual Currency (Wallet):**
    │   │             * Create `Model/Wallet.swift`, `Transaction.swift`
    │   │             * Create `Repository/WalletRepository.swift` with GraphQL queries
    │   │             * Create `ViewModel/WalletViewModel.swift`
    │   │             * Create `View/monetization/WalletView.swift`, `TopUpView.swift`, `TransactionHistoryView.swift`
    │   │           - **Paywall System:**
    │   │             * Create `Repository/PaywallRepository.swift`
    │   │             * Create `ViewModel/PaywallViewModel.swift`
    │   │             * Create `View/monetization/PaywallView.swift`, `PurchaseDialogView.swift`
    │   │             * Integration: Show paywall in Reader when user reaches free chapter limit
    │   │           - **Subscriptions:**
    │   │             * Create `Model/Subscription.swift`
    │   │             * Create `Repository/SubscriptionRepository.swift`
    │   │             * Create `ViewModel/SubscriptionViewModel.swift`
    │   │             * Create `View/monetization/SubscriptionPlansView.swift`, `SubscriptionManageView.swift`
    │   │             * Support: All-You-Can-Read and VIP Loyalty Program
    │   │       15. **Fan Economy Features (NEW):** 🎯 **Author Support System**
    │   │           - **Tipping (打赏):**
    │   │             * **Purpose:** Direct financial support to authors, gamified public recognition
    │   │             * **Model:** `Model/Tip.swift` - Tip data model
    │   │             * **Repository:** `Repository/TippingRepository.swift`
    │   │               - Methods: `tipAuthor()`, `getTippingHistory()`, `getAuthorTippingStats()`
    │   │             * **ViewModel:** `ViewModel/TippingViewModel.swift`
    │   │               - State: tips, tippingHistory, authorStats
    │   │               - Methods: submitTip, loadTippingHistory
    │   │             * **View:** `View/fan-economy/TippingView.swift`
    │   │               - Tipping dialog with amount selector
    │   │               - Shows revenue sharing breakdown (Platform 50%, Tax 6%, Author 44%)
    │   │               - Quick tip buttons (preset amounts)
    │   │             * **Integration:**
    │   │               - Tipping buttons on story detail page
    │   │               - Tipping buttons on author profile page
    │   │               - Tipping history in user profile
    │   │             * **Gamification:**
    │   │               - Large tips grant bonus monthly votes
    │   │               - Tips appear in fan rankings
    │   │           - **Monthly Votes:**
    │   │             * **Purpose:** Voting system for story rankings, community competition
    │   │             * **Model:** `Model/Vote.swift` - Vote data model
    │   │             * **Repository:** `Repository/VotesRepository.swift`
    │   │               - Methods: `voteForStory()`, `getVotesCount()`, `getVoteHistory()`
    │   │             * **ViewModel:** `ViewModel/VotesViewModel.swift`
    │   │               - State: votes, voteCount, voteHistory
    │   │               - Methods: castVote, loadVoteHistory
    │   │             * **View:** `View/fan-economy/VotesView.swift`
    │   │               - Vote button with vote count
    │   │               - Shows available votes (monthly allocation)
    │   │               - Vote history display
    │   │             * **Integration:**
    │   │               - Vote buttons on story detail page
    │   │               - Vote buttons in story cards
    │   │             * **Gamification:**
    │   │               - Large tips grant bonus votes
    │   │               - Votes affect story rankings
    │   │           - **Fan Rankings (粉丝榜):**
    │   │             * **Purpose:** Public leaderboard of top supporters, social status
    │   │             * **Repository:** `Repository/FanRankingsRepository.swift`
    │   │               - Methods: `getFanRankings()`, `getTopSupporters()`, `getUserRanking()`
    │   │             * **ViewModel:** `ViewModel/FanRankingsViewModel.swift`
    │   │               - State: rankings, topSupporters, userRanking
    │   │               - Methods: loadRankings, loadTopSupporters
    │   │             * **View:** `View/fan-economy/FanRankingsView.swift`
    │   │               - Leaderboard list with rank, user info, score
    │   │               - Filter by: story-specific, author-specific, all-time, monthly
    │   │               - Ranking badge component
    │   │             * **Integration:**
    │   │               - Fan rankings section on story detail page
    │   │               - Fan rankings section on author profile page
    │   │               - User's ranking badge in profile
    │   │           - **Author-Fan Interaction:**
    │   │             * **Purpose:** Direct communication between authors and fans
    │   │             * **Repository:** `Repository/AuthorFanRepository.swift`
    │   │               - Methods: `getAuthorProfile()`, `getAuthorFanInteractions()`, `getFanAnalytics()` (author only)
    │   │             * **ViewModel:** `ViewModel/AuthorFanViewModel.swift`
    │   │               - State: authorProfile, interactions, analytics
    │   │             * **View:** `View/fan-economy/AuthorSupportView.swift`
    │   │               - Author profile with fan stats
    │   │               - Q&A sessions, author updates
    │   │               - Author analytics (author view)
    │   │           - **Gamification Loop:**
    │   │             * **Reward Cycle:** Tipping → Rankings → Votes → More readers → More tips
    │   │             * **UI Indicators:**
    │   │               - Show bonus votes granted from large tips
    │   │               - Highlight user's ranking position
    │   │               - Display gamification rewards (badges, status)
    │   │       16. **AI Service Features (NEW):**
    │   │           - **Translation:**
    │   │             * Create `Model/Translation.swift`
    │   │             * Create `Repository/TranslationRepository.swift`
    │   │             * Create `ViewModel/TranslationViewModel.swift`
    │   │             * Create `View/ai/TranslationView.swift`
    │   │             * Integration: Translation in Reader (translate selected text)
    │   │           - **Summarization:**
    │   │             * Create `Repository/SummarizationRepository.swift`
    │   │             * Create `ViewModel/SummarizationViewModel.swift`
    │   │             * Create `View/ai/SummarizationView.swift`
    │   │       17. **Notification Features (NEW):**
    │   │           - Create `Model/Notification.swift`
    │   │           - Create `Repository/NotificationsRepository.swift`
    │   │           - Create `ViewModel/NotificationsViewModel.swift`
    │   │           - Create `View/notifications/NotificationCenterView.swift`, `NotificationSettingsView.swift`
    │   │           - Real-time: WebSocket for real-time notifications
    │   │           - Push notifications: Integrate with iOS Push Notification service
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
