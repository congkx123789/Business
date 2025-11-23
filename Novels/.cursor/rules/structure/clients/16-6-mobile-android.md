---
alwaysApply: true
---

# 📖 Hướng dẫn Sử dụng Documentation này

## 🎯 Công dụng của File này

File này là **bản thiết kế chi tiết (blueprint)** cho package `6-mobile-android` - Android Native App. Nó mô tả:

1. **Cấu trúc thư mục (Folder Structure):** Tất cả các file và folder cần tạo trong Android Studio project
2. **Architecture Pattern:** MVVM + Repository Pattern (Rule #5, #8)
3. **Components & Screens:** Tất cả Jetpack Compose Screens cần implement
4. **ViewModels:** Business logic và state management (Kotlin Flow)
5. **Repositories:** Data layer - quyết định fetch từ network hay local database
6. **Development Steps:** Lộ trình triển khai từng feature theo thứ tự ưu tiên

## 🏗️ Cấu trúc Tổng Hệ thống

```
Monorepo Structure:
├── 1-gateway/          # API Gateway (GraphQL endpoint)
├── 2-services/         # Microservices (users, stories, ai, etc.)
├── 3-web/              # Next.js Web Frontend
├── 4-desktop/          # Electron Desktop App
├── 5-mobile-ios/       # iOS Native App
├── 6-mobile-android/   # ← BẠN ĐANG Ở ĐÂY: Android Native App
└── 7-shared/           # Shared Types, DTOs (convert sang Kotlin data classes)
```

**Luồng dữ liệu (MVVM + Repository Pattern):**
```
Jetpack Compose Screen
    ↓ (collects StateFlow)
ViewModel (StateFlow/Flow)
    ↓ (calls methods)
Repository (decides: Network or Local?)
    ├── GraphQLService (Apollo Client) → 1-gateway → 2-services
    └── AppDatabase (Room) → Local Database
```

**🔄 Cross-Device Synchronization (CRITICAL - Rule #8):**
```
Android App (Device A)
    ↓ (updates Room, syncs to backend)
Backend (users-service)
    ↓ (syncs to all devices via WebSocket)
Web App (Device B) ← iOS App (Device C) ← Desktop App (Device D)
    ↓ (receives real-time updates)
All devices have identical state (library, progress, preferences)
```

**⚠️ CRITICAL REQUIREMENT:** 
Synchronization is the MOST IMPORTANT feature. All data must sync seamlessly across web, mobile (Android/iOS), and desktop:
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
   - **MVVM:** Composable chỉ hiển thị, ViewModel xử lý logic
   - **Repository Pattern:** Repository quyết định fetch từ đâu (network/local)
   - **Offline-First:** Luôn load từ Room trước, sau đó sync từ network

### 2. **Đọc theo thứ tự:**
   - **Package Info:** Hiểu tech stack, architecture
   - **Source Code Structure:** Xem folder structure chi tiết
   - **Development Steps:** Làm theo từng bước (1 → 18)

### 3. **Tìm kiếm nhanh:**
   - Dùng `Ctrl+F` để tìm Screen/ViewModel/Repository cụ thể
   - Ví dụ: Tìm "StoryReaderScreen" → Thấy ở `ui/StoryReaderScreen.kt`

## 🔨 Workflow: Từ Documentation → Code

### Ví dụ: Implement Reader Interface

**Bước 1: Đọc Development Steps (dòng 290-449)**
```
9. Reader Interface (Core Reading Experience):
   - UI Customization: Tap-to-Show Controls, Background Modes...
```

**Bước 2: Tìm Screen Structure (dòng 85-196)**
```
├── 📁 ui/
│   ├── StoryReaderScreen.kt        # Reader interface
│   └── settings/
│       └── ReadingPreferencesScreen.kt
```

**Bước 3: Tìm ViewModel (dòng 60-83)**
```
├── 📁 viewmodel/
│   ├── StoryReaderViewModel.kt     # Reader logic
│   └── SettingsViewModel.kt
```

**Bước 4: Tìm Repository (dòng 202-220)**
```
├── 📁 repository/
│   ├── StoryRepository.kt          # Decides: GraphQLService or AppDatabase
│   └── ReadingProgressRepository.kt
```

**Bước 5: Implement theo thứ tự:**
1. Tạo Model data classes (convert từ 7-shared types)
2. Tạo Room Entities và DAOs
3. Tạo Repository với logic: Load từ Room → Fetch từ GraphQL → Update Room
4. Tạo ViewModel với StateFlow, gọi Repository
5. Tạo Jetpack Compose Screen, collect StateFlow

## 💡 Best Practices khi Code

### 1. **MVVM Pattern:**
```kotlin
// ✅ Composable: Chỉ hiển thị UI
@Composable
fun StoryReaderScreen(viewModel: StoryReaderViewModel = hiltViewModel()) {
    val chapterContent by viewModel.chapterContent.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadChapter()
    }
    
    Text(chapterContent)
}

// ✅ ViewModel: Xử lý logic
@HiltViewModel
class StoryReaderViewModel @Inject constructor(
    private val repository: StoryRepository
) : ViewModel() {
    private val _chapterContent = MutableStateFlow("")
    val chapterContent: StateFlow<String> = _chapterContent.asStateFlow()
    
    fun loadChapter() {
        viewModelScope.launch {
            repository.getChapter(id = chapterId).collect { chapter ->
                _chapterContent.value = chapter.content
            }
        }
    }
}
```

### 2. **Repository Pattern (Offline-First):**
```kotlin
// ✅ Repository: Quyết định fetch từ đâu
class StoryRepository @Inject constructor(
    private val graphQLService: GraphQLService,
    private val appDatabase: AppDatabase
) {
    fun getChapter(id: String): Flow<Chapter> = flow {
        // 1. Load từ Room trước (instant)
        appDatabase.chapterDao().getChapter(id)?.let { chapter ->
            emit(chapter)
        }
        
        // 2. Fetch từ network (background)
        val networkChapter = graphQLService.fetchChapter(id)
        
        // 3. Update Room
        appDatabase.chapterDao().insertChapter(networkChapter)
        emit(networkChapter)
    }
}
```

### 3. **Import Types từ 7-shared:**
```kotlin
// ⚠️ Lưu ý: 7-shared là TypeScript, cần convert sang Kotlin
// Tạo model/Story.kt dựa trên StoryDto từ 7-shared
data class Story(
    val id: String,
    val title: String,
    val author: String,
    // ... map từ StoryDto
)
```

### 4. **Room Database:**
```kotlin
// Tạo Room Entity và DAO
@Entity(tableName = "stories")
data class StoryEntity(
    @PrimaryKey val id: String,
    val title: String,
    val author: String
)

@Dao
interface StoryDao {
    @Query("SELECT * FROM stories WHERE id = :id")
    suspend fun getStory(id: String): StoryEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStory(story: StoryEntity)
}
```

## 🔗 Liên kết Quan trọng

- **Mobile Coding Guide:** [MOBILE_CODING_GUIDE.md](../MOBILE_CODING_GUIDE.md) - ⭐ **ĐỌC TRƯỚC**
- **Backend Services:** [Services Documentation](../services/04-2-services-overview.md)
- **Shared Types:** [7-shared Documentation](../shared/17-7-shared.md) - Convert sang Kotlin
- **Gateway API:** [Gateway Documentation](../gateway/03-1-gateway.md) - GraphQL schema

## ⚠️ Lưu Ý Quan trọng

1. **Rule #8 (Offline-First):** Luôn load từ Room trước, fetch network sau
2. **Rule #5 (MVVM):** Composable chỉ collect StateFlow, không gọi Repository trực tiếp
3. **Repository Pattern:** Repository là single source of truth cho data fetching
4. **Type Conversion:** 7-shared types (TypeScript) → Kotlin data classes (manual conversion)
5. **Hilt Dependency Injection:** Sử dụng @HiltViewModel, @Inject cho DI

---

├── 📦 6-mobile-android/                # 🤖 ANDROID NATIVE APP (Android Studio)
    │   │
    │   ├── 📋 Package Info
    │   │   ├── **Architecture:** MVVM + Repository Pattern (Rule #5, #8)
    │   │   ├── **Key Tech:**
    │   │   │   - `Jetpack Compose` (UI framework)
    │   │   │   - `Kotlin Coroutines/Flow` (async/reactive state)
    │   │   │   - `Room` (offline database)
    │   │   │   - `Apollo Android Client` (GraphQL client)
    │   │   │   - `Hilt` (dependency injection)
    │   │   │   - `android.speech.tts.TextToSpeech` (native TTS)
    │   │   │   - `androidx.documentfile` (file import/export)
    │   │   │   - `MPAndroidChart` (reading statistics charts)
    │   │   │   - `AppSearch` (advanced search indexing)
    │   │   └── **Deployment:** Google Play Store (Android)
    │   │
    │   │   ├── **Mobile-Specific Features:**
    │   │   │   - **Offline-First:** Full offline support with Room (Rule #8)
    │   │   │   - **Download for Offline:** Download stories/chapters for offline reading
    │   │   │   - **Bulk Operations:** Select multiple items, batch actions (delete, move to bookshelf, etc.)
    │   │   │   - **Export/Import:** Export library, annotations, reading progress (Share Intent, Storage Access Framework)
    │   │   │   - **Advanced Search/Filter:** Complex queries, saved filters, AppSearch integration
    │   │   │   - **Reading Statistics:** WPM (words per minute), reading time, progress charts
    │   │   │   - **Multi-column Reading:** Newspaper-style multi-column layout (tablets)
    │   │   │   - **Reader Sidebar:** Swipeable sidebar for notes/bookmarks
    │   │   │   - **Rich Text Annotations:** Advanced annotation tools with formatting
    │   │   │   - **Customizable Layout:** Layout preferences (grid/list, sort options)
    │   │   │   - **Haptic Feedback:** Tactile feedback for interactions (VibrationEffect)
    │   │   │   - **Widget Support:** Home screen widgets (reading progress, recent stories)
    │   │   │   - **Shortcuts Integration:** App Shortcuts for quick actions
    │   │   │   - **Share Extensions:** Share content from other apps (ShareReceiver)
    │   │
    │   ├── 📁 Source Code Structure
    │   │   └── app/
    │   │       └── src/main/
    │   │           ├── 📁 java/com/yourcompany/truyenapp/
    │   │           │   ├── MainApplication.kt            # App entry (Sentry, Hilt @HiltAndroidApp)
    │   │           │   │
    │   │           │   ├── 📁 model/                     # Data Models (from 7-shared)
    │   │           │   │   ├── Story.kt                  # Story data class
    │   │           │   │   ├── Chapter.kt                # Chapter data class
    │   │           │   │   ├── User.kt                   # User data class
    │   │           │   │   ├── Post.kt                  # Post data class
    │   │           │   │   ├── Group.kt                  # Group data class
      │   │           │   │   ├── Library.kt                # Library data class (Enhanced - 2.1, 2.2, 2.3)
      │   │           │   │   ├── Bookshelf.kt              # Bookshelf data class (Enhanced - 2.1)
      │   │           │   │   ├── Tag.kt                     # Tag data class (NEW - 2.1)
      │   │           │   │   ├── FilteredView.kt            # FilteredView data class (NEW - 2.1)
      │   │           │   │   ├── SystemList.kt              # SystemList data class (NEW - 2.1)
      │   │           │   │   └── FilterQuery.kt              # FilterQuery data class (NEW - 2.1)
    │   │           │   │   ├── ReadingPreferences.kt      # Reading preferences data class
    │   │           │   │   ├── Wallet.kt                  # Wallet & Virtual Currency (NEW)
    │   │           │   │   ├── Transaction.kt             # Transaction data class (NEW)
    │   │           │   │   ├── Subscription.kt            # Subscription data class (NEW)
    │   │           │   │   ├── Tip.kt                     # Tipping data class (NEW)
    │   │           │   │   ├── Vote.kt                    # Vote data class (NEW)
    │   │           │   │   ├── Notification.kt            # Notification data class (NEW)
    │   │           │   │   └── Translation.kt             # Translation data class (NEW)
    │   │           │   │
    │   │           │   ├── 📁 viewmodel/                 # MVVM ViewModels (@HiltViewModel)
    │   │           │   │   ├── StoryReaderViewModel.kt   # Reader logic (uses TextToSpeechManager)
      │   │           │   │   ├── LibraryViewModel.kt       # Library management (Enhanced - 2.1, 2.2, 2.3)
      │   │           │   │   ├── BookshelfViewModel.kt     # Bookshelf organization (Enhanced - 2.1)
      │   │           │   │   ├── LibraryAutoOrganizationViewModel.kt  # Auto-organization (NEW - 2.1)
      │   │           │   │   ├── TagsViewModel.kt          # Tag management (NEW - 2.1)
      │   │           │   │   ├── FilteredViewViewModel.kt  # Filtered views (NEW - 2.1)
      │   │           │   │   ├── DownloadManagerViewModel.kt  # Download management (NEW - 2.2)
      │   │           │   │   └── SyncStatusViewModel.kt    # Sync status (Enhanced - 2.3)
    │   │           │   │   ├── FeedViewModel.kt          # Social feed
    │   │           │   │   ├── GroupViewModel.kt         # Group management
    │   │           │   │   ├── StorefrontViewModel.kt     # Discovery & Storefront (NEW)
    │   │           │   │   ├── RankingsViewModel.kt          # Rankings (NEW)
    │   │           │   │   ├── RecommendationsViewModel.kt  # Personalized recommendations (NEW)
    │   │           │   │   ├── CommunityViewModel.kt     # Community interactions (NEW)
    │   │           │   │   ├── SettingsViewModel.kt      # TTS & app settings
      │   │           │   │   ├── BulkOperationsViewModel.kt  # Bulk operations (NEW)
      │   │           │   │   ├── ExportImportViewModel.kt    # Export/Import (Enhanced - from web)
      │   │           │   │   ├── AdvancedSearchViewModel.kt  # Advanced search (Enhanced - from web)
      │   │           │   │   ├── CommandPaletteViewModel.kt   # Command palette (NEW - from web, mobile-optimized)
      │   │           │   │   │   # - Search stories, chapters, annotations, settings
      │   │           │   │   │   # - Quick actions management
      │   │           │   │   │   # - Results categorization
      │   │           │   │   └── AnnotationTemplatesViewModel.kt  # Annotation templates (NEW - from web)
      │   │           │   │       # - Save annotation templates for quick use
      │   │           │   │       # - Template management (create, edit, delete)
      │   │           │   │       # - Apply templates to new annotations
    │   │           │   │   ├── ReadingStatsViewModel.kt    # Reading statistics (NEW)
    │   │           │   │   ├── WalletViewModel.kt          # Wallet & Payments (NEW)
    │   │           │   │   ├── PaywallViewModel.kt         # Paywall & Purchase (NEW)
    │   │           │   │   ├── SubscriptionViewModel.kt    # Subscription management (NEW)
    │   │           │   │   ├── TippingViewModel.kt         # Tipping functionality (NEW)
    │   │           │   │   ├── VotesViewModel.kt           # Monthly votes (NEW)
    │   │           │   │   ├── FanRankingsViewModel.kt     # Fan rankings (NEW)
    │   │           │   │   ├── TranslationViewModel.kt     # Translation (NEW)
    │   │           │   │   ├── SummarizationViewModel.kt   # Summarization (NEW)
    │   │           │   │   └── NotificationsViewModel.kt   # Notifications (NEW)
    │   │           │   │
    │   │           │   ├── 📁 ui/                        # Jetpack Compose Screens
    │   │           │   │   ├── StoryReaderScreen.kt      # Reader interface
      │   │           │   │   ├── LibraryScreen.kt          # Library dashboard (Enhanced - 2.1, 2.2, 2.3)
      │   │           │   │   ├── BookshelfScreen.kt        # Bookshelf management (Enhanced - 2.1)
      │   │           │   │   │
      │   │           │   │   ├── 📁 Library/AutoOrganization/  # Auto-Organization Screens (NEW - 2.1)
      │   │           │   │   │   ├── LibraryAutoOrganizationScreen.kt  # Auto-grouping by author/series
      │   │           │   │   │   ├── AuthorGroupScreen.kt      # Books grouped by author
      │   │           │   │   │   ├── SeriesGroupScreen.kt      # Books grouped by series
      │   │           │   │   │   └── SystemListsScreen.kt      # System lists (Favorites, To Read, etc.)
      │   │           │   │   │
      │   │           │   │   ├── 📁 Library/Tags/              # Tag Management Screens (NEW - 2.1)
      │   │           │   │   │   ├── TagManagerScreen.kt       # Tag creation, editing, hierarchy
      │   │           │   │   │   ├── TagSelectorScreen.kt      # Multi-select tag picker
      │   │           │   │   │   ├── TagChip.kt                # Individual tag chip composable
      │   │           │   │   │   └── TagHierarchyScreen.kt     # Tag hierarchy tree view
      │   │           │   │   │
      │   │           │   │   ├── 📁 Library/FilteredViews/    # Filtered Views (NEW - 2.1)
      │   │           │   │   │   ├── FilteredViewBuilderScreen.kt  # Query builder UI
      │   │           │   │   │   ├── FilteredViewListScreen.kt     # List of saved filtered views
      │   │           │   │   │   └── FilterQueryBuilderScreen.kt  # Visual query builder
      │   │           │   │   │
      │   │           │   │   ├── 📁 Library/DownloadManagement/  # Download Management Screens (NEW - 2.2)
      │   │           │   │   │   ├── DownloadManagerScreen.kt    # Download queue and management
      │   │           │   │   │   ├── DownloadQueueScreen.kt      # Download queue list
      │   │           │   │   │   ├── StorageManagerScreen.kt    # Storage usage and cleanup
      │   │           │   │   │   └── DownloadSettingsScreen.kt   # Auto-download preferences
      │   │           │   │   │
      │   │           │   │   ├── 📁 Library/Sync/               # Sync Screens (Enhanced - 2.3)
      │   │           │   │   │   ├── SyncStatusScreen.kt        # Sync status display
      │   │           │   │   │   └── SyncConflictResolverScreen.kt  # Conflict resolution dialog
    │   │           │   │   ├── FeedScreen.kt             # Social feed
    │   │           │   │   ├── GroupListScreen.kt        # Groups listing
    │   │           │   │   ├── GroupDetailScreen.kt      # Group detail
    │   │           │   │   ├── StorefrontScreen.kt       # Discovery & Storefront (NEW)
    │   │           │   │   ├── RankingsScreen.kt           # Rankings listing (NEW)
    │   │           │   │   ├── RecommendationsScreen.kt  # Recommendations (NEW)
    │   │           │   │   │
    │   │           │   │   ├── 📁 community/              # Community Interaction Screens (Hierarchical) (NEW)
    │   │           │   │   │   ├── 📁 paragraph-comments/  # Micro: Paragraph Comments (Duanping)
    │   │           │   │   │   │   ├── ParagraphCommentBubble.kt  # Comment bubble on paragraph
    │   │           │   │   │   │   ├── ParagraphCommentPanel.kt   # Panel showing all paragraph comments
    │   │           │   │   │   │   ├── QuickReactionButtons.kt    # Quick reaction buttons (Haha, WTF, etc.)
    │   │           │   │   │   │   └── ParagraphCommentList.kt    # List of comments for paragraph
    │   │           │   │   │   │
    │   │           │   │   │   ├── 📁 chapter-comments/    # Meso: Chapter-End Comments (本章说)
    │   │           │   │   │   │   ├── ChapterCommentsSection.kt  # Section at end of chapter
    │   │           │   │   │   │   ├── ChapterCommentThread.kt    # Threaded comment display
    │   │           │   │   │   │   ├── ChapterCommentForm.kt       # Form to create chapter comment
    │   │           │   │   │   │   ├── CommentVoting.kt            # Upvote/downvote component
    │   │           │   │   │   │   └── CommentSortSelector.kt      # Sort by time/popularity
    │   │           │   │   │   │
    │   │           │   │   │   ├── 📁 reviews/             # Macro: Book Reviews
    │   │           │   │   │   │   ├── ReviewsSection.kt          # Reviews section on story page
    │   │           │   │   │   │   ├── ReviewCard.kt               # Individual review card
    │   │           │   │   │   │   ├── ReviewForm.kt              # Form to create review
    │   │           │   │   │   │   ├── ReviewRatings.kt           # Structured ratings (plot, characters, etc.)
    │   │           │   │   │   │   ├── ReviewHelpfulVoting.kt     # Helpful/Not helpful voting
    │   │           │   │   │   │   └── FeaturedReviews.kt         # Featured reviews carousel
    │   │           │   │   │   │
    │   │           │   │   │   ├── 📁 forums/              # Macro: Discussion Forums
    │   │           │   │   │   │   ├── ForumSection.kt            # Forum section on story page
    │   │           │   │   │   │   ├── ForumThreadList.kt         # List of forum threads
    │   │           │   │   │   │   ├── ForumThreadCard.kt         # Individual thread card
    │   │           │   │   │   │   ├── ForumThreadDetail.kt       # Thread detail with posts
    │   │           │   │   │   │   ├── ForumPostThread.kt        # Threaded post display
    │   │           │   │   │   │   ├── ForumPostForm.kt          # Form to create post
    │   │           │   │   │   │   ├── ForumCategorySelector.kt  # Category selector
    │   │           │   │   │   │   └── ForumModeration.kt        # Moderation tools (pin, lock)
    │   │           │   │   │   │
    │   │           │   │   │   └── 📁 platform-interactions/  # Platform Interactions
    │   │           │   │   │       ├── 📁 polls/
    │   │           │   │   │       │   ├── PollCard.kt            # Poll display card
    │   │           │   │   │       │   ├── PollVoting.kt         # Poll voting interface
    │   │           │   │   │       │   ├── PollResults.kt        # Poll results display
    │   │           │   │   │       │   └── PollList.kt           # List of polls
    │   │           │   │   │       │
    │   │           │   │   │       └── 📁 quizzes/
    │   │           │   │   │           ├── QuizCard.kt           # Quiz display card
    │   │           │   │   │           ├── QuizInterface.kt      # Quiz taking interface
    │   │           │   │   │           ├── QuizResults.kt        # Quiz results display
    │   │           │   │   │           ├── QuizLeaderboard.kt    # Quiz leaderboard
    │   │           │   │   │           └── QuizList.kt           # List of quizzes
    │   │           │   │   │
    │   │           │   │   ├── 📁 mobile/                 # Mobile-Specific Screens (NEW)
    │   │           │   │   │   ├── 📁 bulk-operations/    # Bulk selection & actions
    │   │           │   │   │   │   ├── BulkSelectionScreen.kt    # Multi-select interface
    │   │           │   │   │   │   ├── BulkActionBar.kt          # Bulk action toolbar
    │   │           │   │   │   │   └── SelectionManager.kt       # Selection state manager
    │   │           │   │   │   │
    │   │           │   │   │   ├── 📁 export-import/      # Export/Import features
      │   │           │   │   │   │   ├── ExportScreen.kt            # Export library/annotations
      │   │           │   │   │   │   ├── ImportScreen.kt            # Import data
      │   │           │   │   │   │   ├── ScheduledExportScreen.kt   # Scheduled exports (NEW - from web)
      │   │           │   │   │   │   └── ExportHistoryScreen.kt      # Export history (NEW - from web)
    │   │           │   │   │   │   └── ShareIntentHandler.kt      # Share intent integration
    │   │           │   │   │   │
      │   │           │   │   │   ├── 📁 advanced-search/    # Advanced search/filter
      │   │           │   │   │   │   ├── AdvancedSearchScreen.kt    # Complex search UI
      │   │           │   │   │   │   ├── SearchHistoryScreen.kt     # Search history (NEW - from web)
      │   │           │   │   │   │   ├── SearchSuggestionsScreen.kt # Search suggestions (NEW - from web)
      │   │           │   │   │   │   └── FilterPresetsScreen.kt     # Filter presets (NEW - from web)
      │   │           │   │   │   │
      │   │           │   │   │   ├── 📁 command-palette/    # Command Palette (NEW - from web, mobile-optimized)
      │   │           │   │   │   │   ├── CommandPaletteScreen.kt    # Search overlay (swipe down to open)
      │   │           │   │   │   │   │   # - Native Android search experience using Material 3 SearchBar
      │   │           │   │   │   │   │   # - Swipe down gesture to open (Android native)
      │   │           │   │   │   │   │   # - Search stories, chapters, annotations, settings
      │   │           │   │   │   │   │   # - Quick actions: Navigate, create, search
      │   │           │   │   │   │   │   # - Keyboard shortcuts hints (tablets with keyboard)
      │   │           │   │   │   │   └── CommandPaletteResults.kt   # Search results list
      │   │           │   │   │   │       # - Categorized results (Stories, Chapters, Annotations, Settings)
      │   │           │   │   │   │       # - Tap to navigate or execute action
    │   │           │   │   │   │   ├── SavedFiltersScreen.kt      # Saved filter presets
    │   │           │   │   │   │   └── SearchBuilderScreen.kt     # Query builder UI
    │   │           │   │   │   │
    │   │           │   │   │   ├── 📁 reading-stats/      # Reading statistics
    │   │           │   │   │   │   ├── ReadingStatsScreen.kt      # Statistics dashboard
    │   │           │   │   │   │   ├── ReadingTimeChart.kt        # Reading time chart
    │   │           │   │   │   │   ├── WPMTracker.kt              # Words per minute tracker
    │   │           │   │   │   │   └── ProgressChart.kt           # Progress visualization
    │   │           │   │   │   │
    │   │           │   │   │   └── 📁 reader-enhanced/    # Enhanced reader features
    │   │           │   │   │       ├── MultiColumnReaderScreen.kt # Multi-column reading (tablets)
    │   │           │   │   │       ├── ReaderSidebarScreen.kt     # Swipeable sidebar for notes
      │   │           │   │   │       ├── AdvancedAnnotationEditor.kt  # Rich text annotation editor
      │   │           │   │   │       ├── AnnotationTemplatesScreen.kt # Annotation templates (NEW - from web)
      │   │           │   │   │       │   # - Save annotation templates (formatting, colors, tags)
      │   │           │   │   │       │   # - Quick apply templates to new annotations
      │   │           │   │   │       │   # - Template management UI
      │   │           │   │   │       ├── AnnotationSearchScreen.kt    # Search within annotations (NEW - from web)
      │   │           │   │   │       │   # - Search annotations by text, tags, dates
      │   │           │   │   │       │   # - Filter by story, chapter, annotation type
      │   │           │   │   │       │   # - Full-text search with highlighting
      │   │           │   │   │       └── AnnotationExportScreen.kt    # Export annotations (NEW - from web)
      │   │           │   │   │           # - Export annotations as Markdown, PDF
      │   │           │   │   │           # - Export to Notion, Obsidian, Capacities
      │   │           │   │   │           # - Batch export with format selection
    │   │           │   │   │       └── ReaderLayoutManager.kt     # Customizable layout presets
    │   │           │   │   │
    │   │           │   │   ├── 📁 monetization/          # Monetization Screens (NEW)
    │   │           │   │   │   ├── WalletScreen.kt            # Wallet dashboard
    │   │           │   │   │   ├── TopUpScreen.kt             # Top-up wallet
    │   │           │   │   │   ├── TransactionHistoryScreen.kt # Transaction history
    │   │           │   │   │   ├── PaywallScreen.kt           # Paywall banner
    │   │           │   │   │   ├── PurchaseDialogScreen.kt    # Purchase dialog
    │   │           │   │   │   ├── SubscriptionPlansScreen.kt # Subscription plans
    │   │           │   │   │   └── SubscriptionManageScreen.kt # Manage subscription
    │   │           │   │   │
    │   │           │   │   ├── 📁 fan-economy/            # Fan Economy Screens (NEW)
    │   │           │   │   │   ├── TippingScreen.kt           # Tipping dialog
    │   │           │   │   │   ├── VotesScreen.kt             # Vote button & display
    │   │           │   │   │   ├── FanRankingsScreen.kt       # Fan rankings list
    │   │           │   │   │   └── AuthorSupportScreen.kt     # Author support stats
    │   │           │   │   │
    │   │           │   │   ├── 📁 ai/                    # AI Service Screens (NEW)
    │   │           │   │   │   ├── TranslationScreen.kt       # Translation panel
    │   │           │   │   │   └── SummarizationScreen.kt     # Summary display
    │   │           │   │   │
    │   │           │   │   ├── 📁 notifications/          # Notification Screens (NEW)
    │   │           │   │   │   ├── NotificationCenterScreen.kt # Notification center
    │   │           │   │   │   └── NotificationSettingsScreen.kt # Notification settings
    │   │           │   │   │
    │   │           │   │   └── settings/
    │   │           │   │       ├── TTSSettingsScreen.kt  # TTS engine selection
    │   │           │   │       ├── ReadingPreferencesScreen.kt  # Reading settings
    │   │           │   │       └── LayoutSettingsScreen.kt      # Layout preferences (NEW)
    │   │           │   │
    │   │           │   ├── 📁 network/                    # Network Services
    │   │           │   │   ├── GraphQLService.kt         # Apollo Client (calls 1-gateway GraphQL)
    │   │           │   │   │   │                            # - **Monetization Queries/Mutations:** ⭐
    │   │           │   │   │   │                            #   * getWalletBalance() → Query: getBalance()
    │   │           │   │   │   │                            #   * topUpWallet(amount) → Mutation: topUp()
    │   │           │   │   │   │                            #   * getTransactionHistory() → Query: getTransactionHistory()
    │   │           │   │   │   │                            #   * purchaseChapter(chapterId) → Mutation: purchaseChapter()
    │   │           │   │   │   │                            #   * purchaseBulk(chapterIds) → Mutation: purchaseBulk()
    │   │           │   │   │   │                            #   * getPurchaseHistory() → Query: getPurchaseHistory()
    │   │           │   │   │   │                            #   * getSubscriptionPlans() → Query: getMembership()
    │   │           │   │   │   │                            #   * subscribe(planId) → Mutation: createMembership()
    │   │           │   │   │   │                            #   * getSubscriptionStatus() → Query: getMembership()
    │   │           │   │   │   │                            #   * cancelSubscription() → Mutation: cancelMembership()
    │   │           │   │   │   │                            #   * purchasePrivilege(storyId) → Mutation: purchasePrivilege()
    │   │           │   │   │   │                            #   * getPrivilege(storyId) → Query: getPrivilege()
    │   │           │   │   │   │                            #   * getAdvancedChapters(storyId) → Query: getAdvancedChapters()
    │   │           │   │   │   │                            # - **Community Queries/Mutations:** ⭐
    │   │           │   │   │   │                            #   * createParagraphComment(chapterId, paragraphIndex, content, reactionType?) → Mutation: createParagraphComment()
    │   │           │   │   │   │                            #   * getParagraphComments(chapterId, paragraphIndex?) → Query: getParagraphComments()
    │   │           │   │   │   │                            #   * getParagraphCommentCounts(chapterId) → Query: getParagraphCommentCounts()
    │   │           │   │   │   │                            #   * likeParagraphComment(commentId) → Mutation: likeParagraphComment()
    │   │           │   │   │   │                            #   * replyToParagraphComment(commentId, content) → Mutation: replyToParagraphComment()
    │   │           │   │   │   │                            #   * createTip(storyId, amount, message?) → Mutation: createTip()
    │   │           │   │   │   │                            #   * getFanRankings(storyId?, authorId?) → Query: getFanRankings()
    │   │           │   │   │   │                            #   * castMonthlyVote(storyId, votes) → Mutation: castMonthlyVote()
    │   │           │   │   │   │                            #   * createChapterComment(chapterId, content) → Mutation: createChapterComment()
    │   │           │   │   │   │                            #   * createReview(storyId, rating, content) → Mutation: createReview()
    │   │           │   │   │   │                            #   * votePoll(pollId, optionId) → Mutation: votePoll()
    │   │           │   │   └── WebSocketService.kt       # Socket.IO client (websocket-service)
    │   │           │   │       │                            # - **WebSocket Subscriptions:** ⭐
    │   │           │   │       │                            #   * subscribe("paragraph-comments:$chapterId") → Real-time paragraph comment updates
    │   │           │   │       │                            #   * subscribe("wallet:$userId") → Real-time wallet balance updates
    │   │           │   │       │                            #   * subscribe("purchases:$userId") → Real-time purchase confirmations
    │   │           │   │       │                            #   * Events: paragraph.comment.created, purchase.completed, wallet.balance.updated
    │   │           │   │
    │   │           │   ├── 📁 storage/                    # Storage Services (NEW - MVP Phase 1)
    │   │           │   │   ├── ContentStorageService.kt  # Content Storage
    │   │           │   │   │   │                            # - Downloads and stores chapter files in App-Specific Storage
    │   │           │   │   │   │                            # - Uses context.getFilesDir() for app-specific directory
    │   │           │   │   │   │                            # - Separates metadata (Room) from content (files)
    │   │           │   │   │   │                            # - Manages file paths, download queue, storage cleanup
    │   │           │   │   ├── ContentEncryptionService.kt  # Data-at-Rest Encryption
    │   │           │   │   │   │                            # - Encrypts chapter files using AES encryption
    │   │           │   │   │   │                            # - Uses Android Keystore for key management
    │   │           │   │   │   │                            # - AES-256 encryption (strong algorithm)
    │   │           │   │   │   │                            # - DRM Layer 2: Prevents bulk content extraction
    │   │           │   │   │   │                            # - Encrypts on write, decrypts on read
    │   │           │   │   └── SyncService.kt            # Enhanced Sync Service
    │   │           │   │       │                            # - Syncs local state (progress, bookmarks) with backend
    │   │           │   │       │                            # - Conflict resolution: Last-write-wins with timestamp comparison
    │   │           │   │       │                            # - Sync queue: Processes pending updates when online
    │   │           │   │       │                            # - Handles network failures gracefully
    │   │           │   │       │                            # - Syncs: Library, Progress, Bookmarks, Annotations, Preferences
    │   │           │   │
    │   │           │   ├── 📁 repository/                # Repository Pattern (Rule #8 - Offline-First)
    │   │           │   │   ├── StoryRepository.kt        # Decides: GraphQLService or AppDatabase
    │   │           │   │   │   │                            # - **Offline-First:** Load from Room first (instant UI)
    │   │           │   │   │   │                            # - Then fetch from network in background
    │   │           │   │   │   │                            # - Coordinates: AppDatabase (metadata) + ContentStorageService (content)
    │   │           │   │   ├── ChapterRepository.kt       # Chapter Repository (NEW - MVP Phase 1)
    │   │           │   │   │   │                            # - Loads chapter metadata from Room
    │   │           │   │   │   │                            # - Loads chapter content from ContentStorageService (encrypted files)
    │   │           │   │   │   │                            # - Decrypts content on-the-fly when reading
    │   │           │   │   │   │                            # - Downloads missing chapters in background
      │   │           │   │   ├── LibraryRepository.kt      # Library sync logic (Enhanced - 2.1, 2.2, 2.3)
      │   │           │   │   ├── BookshelfRepository.kt    # Bookshelf sync logic (Enhanced - 2.1)
      │   │           │   │   ├── TagRepository.kt          # Tag sync logic (NEW - 2.1)
      │   │           │   │   ├── FilteredViewRepository.kt  # Filtered view sync logic (NEW - 2.1)
      │   │           │   │   ├── DownloadRepository.kt     # Download management (NEW - 2.2)
      │   │           │   │   ├── BookmarkSyncRepository.kt  # Bookmark sync (NEW - 2.3)
      │   │           │   │   └── AnnotationSyncRepository.kt  # Annotation sync (NEW - 2.3)
    │   │           │   │   ├── WishlistRepository.kt     # Wishlist sync logic (NEW)
    │   │           │   │   ├── FeedRepository.kt          # Feed aggregation
    │   │           │   │   ├── ReadingProgressRepository.kt  # Progress sync (Enhanced - Cross-device sync)
    │   │           │   │   ├── ReadingPreferencesRepository.kt  # Reading preferences sync (NEW - Critical for sync)
    │   │           │   │   ├── BookmarkRepository.kt     # Bookmark sync logic (NEW)
    │   │           │   │   ├── AnnotationRepository.kt   # Annotation sync logic (NEW)
    │   │           │   │   └── SyncManager.kt             # Main sync orchestrator (NEW - Cross-device sync)
    │   │           │   │   ├── DiscoveryRepository.kt    # Discovery & Rankings (NEW)
    │   │           │   │   ├── RecommendationsRepository.kt  # Recommendations (NEW)
    │   │           │   │   ├── CommunityRepository.kt    # Community interactions (NEW)
    │   │           │   │   ├── ExportImportRepository.kt  # Export/Import logic (NEW)
    │   │           │   │   ├── SearchRepository.kt        # Advanced search logic (NEW)
    │   │           │   │   ├── ReadingStatsRepository.kt  # Reading statistics (NEW)
    │   │           │   │   ├── WalletRepository.kt        # Wallet & Payments (NEW)
    │   │           │   │   ├── PaywallRepository.kt       # Paywall logic (NEW)
    │   │           │   │   ├── SubscriptionRepository.kt  # Subscription logic (NEW)
    │   │           │   │   ├── TippingRepository.kt       # Tipping logic (NEW)
    │   │           │   │   ├── VotesRepository.kt         # Votes logic (NEW)
    │   │           │   │   ├── TranslationRepository.kt   # Translation logic (NEW)
    │   │           │   │   ├── SummarizationRepository.kt # Summarization logic (NEW)
    │   │           │   │   └── NotificationsRepository.kt # Notifications logic (NEW)
    │   │           │   │
    │   │           │   ├── 📁 database/                  # Room Database (Offline - Metadata Database)
    │   │           │   │   ├── AppDatabase.kt            # @Database Room database (SQLite backend)
    │   │           │   │   │   │                            # - Stores metadata only (NO BLOBs)
    │   │           │   │   │   │                            # - Optimized for complex relationships
    │   │           │   │   │   │                            # - Handles large datasets (millions of records)
    │   │           │   │   ├── dao/
    │   │           │   │   │   ├── StoryDao.kt           # Story queries
    │   │           │   │   │   ├── LibraryDao.kt         # Library queries
    │   │           │   │   │   ├── PostDao.kt            # Post queries
    │   │           │   │   │   └── ReadingProgressDao.kt  # Progress queries
    │   │           │   │   └── entity/
    │   │           │   │       ├── StoryEntity.kt        # Room entity (metadata only)
    │   │           │   │       ├── LibraryEntity.kt      # Room entity (Enhanced - sync fields)
    │   │           │   │       ├── BookshelfEntity.kt    # Room entity (NEW)
    │   │           │   │       ├── WishlistEntity.kt     # Room entity (NEW)
    │   │           │   │       ├── ReadingPreferencesEntity.kt  # Room entity (NEW - Critical for sync)
    │   │           │   │       ├── BookmarkEntity.kt     # Room entity (NEW)
    │   │           │   │       ├── AnnotationEntity.kt   # Room entity (NEW)
    │   │           │   │       ├── PostEntity.kt         # Room entity
    │   │           │   │       ├── ReadingProgressEntity.kt  # Room entity (Enhanced - sync fields)
    │   │           │   │       ├── SyncStateEntity.kt    # Sync state tracking (NEW)
    │   │           │   │       └── ChapterMetadataEntity.kt  # Chapter metadata (NEW - MVP Phase 1)
    │   │           │   │           │                            # - Stores chapter metadata (title, order, etc.)
    │   │           │   │           │                            # - References content file path (NOT content itself)
    │   │           │   │           │                            # - Links to encrypted content file in App-Specific Storage
    │   │           │   │
    │   │           │   └── 📁 tts/                       # TTS Module
    │   │           │       ├── TTSEngine.kt              # TTS interface
    │   │           │       ├── NativeTTSEngine.kt        # android.speech.tts.TextToSpeech
    │   │           │       ├── EmbeddedTTSEngine.kt       # Proprietary SDK (60MB, high quality)
    │   │           │       └── TextToSpeechManager.kt    # TTS manager (delegates to engines)
    │   │           │
    │   │           │   └── 📁 utils/                     # Utilities
    │   │           │       ├── Extensions.kt             # Kotlin extensions
    │   │           │       │
    │   │           │       └── 📁 mobile/                # Mobile-Specific Utilities (NEW)
    │   │           │           ├── 📁 export/             # Export utilities
    │   │           │           │   ├── ExportManager.kt        # Export library/annotations
    │   │           │           │   ├── ExportFormatter.kt      # Format converters (JSON, CSV, Markdown)
    │   │           │           │   ├── ScheduledExportManager.kt  # Scheduled exports (NEW - from web)
    │   │           │           │   │   # - Background task scheduling using WorkManager
    │   │           │           │   │   # - Auto-export on schedule (daily, weekly)
    │   │           │           │   │   # - Configurable export scope and format
    │   │           │           │   ├── ExportHistoryManager.kt    # Export history tracking (NEW - from web)
    │   │           │           │   │   # - Track all exports with timestamps, format, scope
    │   │           │           │   │   # - Store in Room database for persistence
    │   │           │           │   │   # - View export history with filters
    │   │           │           │   └── ShareIntentManager.kt   # Share intent integration
    │   │           │           │
    │   │           │           ├── 📁 import/             # Import utilities
    │   │           │           │   ├── ImportManager.kt        # Import library from file
    │   │           │           │   ├── ImportValidator.kt      # Validates import data
    │   │           │           │   └── ImportMapper.kt         # Maps imported data to app format
    │   │           │           │
      │   │           │           ├── 📁 search/             # Advanced search
      │   │           │           │   ├── SearchHistoryManager.kt     # Search history (NEW - from web)
      │   │           │           │   │   # - Track recent searches with timestamps
      │   │           │           │   │   # - Store in Room database, limit to last 50 searches
      │   │           │           │   │   # - Quick access from search bar
      │   │           │           │   ├── SearchSuggestionsManager.kt # Search suggestions (NEW - from web)
      │   │           │           │   │   # - Auto-complete based on search history
      │   │           │           │   │   # - Prioritize recent and popular queries
      │   │           │           │   │   # - Real-time suggestions as user types
      │   │           │           │   └── FilterPresetsManager.kt     # Filter presets (NEW - from web)
      │   │           │           │       # - Save frequently used filter combinations
      │   │           │           │       # - Named presets with quick access
      │   │           │           │       # - Store in Room database for persistence
    │   │           │           │   ├── SearchIndexManager.kt   # AppSearch integration
    │   │           │           │   ├── QueryBuilder.kt         # Builds complex search queries
    │   │           │           │   ├── FilterEngine.kt         # Advanced filtering logic
    │   │           │           │   └── SavedFiltersManager.kt  # Saved filter management
    │   │           │           │
    │   │           │           ├── 📁 stats/              # Reading statistics
    │   │           │           │   ├── ReadingStatsCalculator.kt  # Calculates WPM, reading time
    │   │           │           │   ├── StatsStorage.kt          # Stores statistics
    │   │           │           │   └── StatsAggregator.kt       # Aggregates statistics
    │   │           │           │
    │   │           │           ├── 📁 bulk/               # Bulk operations
    │   │           │           │   ├── BulkOperationManager.kt  # Manages bulk operations
    │   │           │           │   └── SelectionStateManager.kt # Manages selection state
    │   │           │           │
    │   │           │           └── 📁 haptics/            # Haptic feedback
    │   │           │               └── HapticManager.kt        # Haptic feedback manager (VibrationEffect)
    │   │           │
    │   │           ├── 📁 res/                           # Android Resources
    │   │           │   ├── layout/                       # XML layouts (if needed)
    │   │           │   ├── values/                      # Strings, colors, themes
    │   │           │   └── drawable/                    # Icons, images
    │   │           │
    │   │           └── AndroidManifest.xml               # App manifest
    │   │
    │   ├── 📁 Configuration Files
    │   │   ├── build.gradle.kts                        # Gradle build config
    │   │   ├── settings.gradle.kts                     # Project settings
    │   │   └── gradle.properties                        # Gradle properties
    │   │
    │   └── 📁 Test Files
    │       └── test/
    │           ├── unit/                                # Unit tests
    │           └── androidTest/                         # Instrumentation tests
    │
    │   📝 **Development Steps:**
    │   │       1.  Setup Hilt (using `@HiltAndroidApp`), Apollo, Room.
    │   │       2.  Create `model/` (data classes) based on `7-shared/` (requires manual translation or type generation), including new `Post`, `Group` data classes.
    │   │       3.  Create `network/GraphQLService.kt` (using **Apollo Android Client**) to call the **GraphQL API** from `1-gateway` (including new social queries/mutations).
    │   │       4.  **Metadata Database (Room/SQLite - MVP Phase 1):**
    │   │           - Create `database/AppDatabase.kt` (using `@Database`, `@Dao` from Room with SQLite backend)
    │   │           - **CRITICAL:** Store metadata ONLY (stories, chapters, library, progress, bookmarks, annotations)
    │   │           - **NO BLOBs:** Do NOT store chapter text content in Room database
    │   │           - Optimize for complex relationships (stories → authors → genres)
    │   │           - Handle large datasets (millions of library records)
    │   │           - Create Room entities: `StoryEntity`, `ChapterMetadataEntity`, `LibraryEntity`, `ReadingProgressEntity`, etc.
    │   │           - `ChapterMetadataEntity` should have `contentFilePath` field (String), NOT `content` (BLOB)
    │   │           - Create DAOs for all entities with optimized queries
    │   │       5.  **Content Storage (MVP Phase 1):**
    │   │           - Create `storage/ContentStorageService.kt`:
    │   │             * Downloads chapter files from backend
    │   │             * Stores files in App-Specific Storage (using `context.getFilesDir()`)
    │   │             * Creates organized folder structure: `files/chapters/{storyId}/{chapterId}.encrypted`
    │   │             * Manages download queue and progress tracking
    │   │             * Handles storage cleanup (old downloads, storage limits)
    │   │           - Create utility for file path management
    │   │       6.  **Data-at-Rest Encryption (MVP Phase 1):**
    │   │           - Create `storage/ContentEncryptionService.kt`:
    │   │             * Encrypts chapter files using AES-256 encryption
    │   │             * Uses Android Keystore for key management (secure key storage)
    │   │             * Encrypts files before writing to disk
    │   │             * Decrypts files when reading for display
    │   │             * Uses `javax.crypto.Cipher` with AES/GCM/NoPadding
    │   │           - Key management:
    │   │             * Generate device-specific keys on first launch
    │   │             * Store keys in Android Keystore (hardware-backed if available)
    │   │             * Support key rotation if needed
    │   │       7.  **Enhanced Sync Service (MVP Phase 1):**
    │   │           - Create `storage/SyncService.kt`:
    │   │             * Syncs local state (from Room) with backend (via GraphQL)
    │   │             * Implements conflict resolution: Last-write-wins (timestamp comparison)
    │   │             * Maintains sync queue for pending updates (when offline)
    │   │             * Processes sync queue when network becomes available
    │   │             * Handles sync failures gracefully (retry logic with exponential backoff)
    │   │             * Syncs: Library, Reading Progress, Bookmarks, Annotations, Preferences
    │   │             * Emits sync status events (using Flow) for UI updates
        │   │       8.  Create `repository/` (Rule #8) (using `Kotlin Flow`) to decide whether to fetch from `GraphQLService` or `AppDatabase`, including feed aggregation logic.
        │   │           - **Offline-First Pattern:** Always load from Room first (instant UI)
        │   │           - Then fetch from network in background and update Room
        │   │           - Repository coordinates between `AppDatabase`, `ContentStorageService`, and `GraphQLService`
        │   │           - **ChapterRepository (NEW - MVP Phase 1):**
        │   │             * Loads chapter metadata from Room (instant)
        │   │             * Loads chapter content from ContentStorageService (encrypted file)
        │   │             * Decrypts content on-the-fly using ContentEncryptionService
        │   │             * Downloads missing chapters in background via ContentStorageService
        │   │             * Updates Room metadata when download completes
        │   │       9.  Create `viewmodel/` (MVVM, using `@HiltViewModel`) to call the `Repository` (which is injected by `Hilt`).
    │   │       7.  Create `ui/` (using `@Composable` functions) to display data (collected from a `StateFlow` in the ViewModel).
    │   │       8.  **New Social Features:**
    │   │           - Update `model/` with `Post.kt`, `Group.kt`, `Follow.kt` data classes.
    │   │           - Update `network/GraphQLService.kt` with social queries: `FeedQuery`, `CreatePostMutation`, `FollowUserMutation`, `JoinGroupMutation`.
    │   │           - Update `database/` with Room entities: `PostEntity`, `GroupEntity`, `FollowEntity` and their DAOs.
    │   │           - Create new ViewModels: `FeedViewModel.kt`, `GroupViewModel.kt`, `PostViewModel.kt`.
    │   │           - Create new Composable screens: `FeedScreen.kt`, `GroupListScreen.kt`, `GroupDetailScreen.kt`, `PostCard.kt`.
        │   │       9.  **Reader Interface (Core Reading Experience - Based on Qidian/QQ Reading):**
        │   │           
        │   │           **1.1. Giao diện Đọc (UI) và Tùy chỉnh Người dùng:**
        │   │           
        │   │           **A. Kích hoạt Menu (Tap to Toggle Controls):**
        │   │           - Tap center of screen to show/hide top/bottom control bars
        │   │           - Implement in `StoryReaderScreen.kt`:
        │   │             - Use `Modifier.pointerInput` with `detectTapGestures` on main content area
        │   │             - State: `var showControls by remember { mutableStateOf(false) }`
        │   │             - Auto-hide: `LaunchedEffect` with `delay(controlsTimeout)` (default: 3000ms)
        │   │             - Controlled by `tapToToggleControls` and `autoHideControls` from ReadingPreferences
        │   │           
        │   │           **B. Chế độ Nền (Background Modes):**
        │   │           - Toggle via moon/sun icon in bottom controls
        │   │           - Implement in `ReadingPreferencesScreen.kt`:
        │   │             - Options: 'white' (Day), 'black' (Night), 'sepia', 'eye-protection' (护眼模式), 'custom'
        │   │             - Eye protection: Yellow/green tint using `Color(0xFFFFF9C4)` overlay
        │   │             - Custom: Color picker using `ColorPicker` composable
        │   │             - Apply via Compose: `Box(modifier = Modifier.background(color))`
        │   │             - **Brightness:** Use `WindowManager.LayoutParams.screenBrightness` (app-only, requires permission)
    │   │             - **Brightness Sync (CRITICAL):** 
    │   │               * Brightness preference (0-100) must sync across devices via `ReadingPreferencesRepository.kt`
    │   │               * Web/desktop applies via CSS brightness filter
    │   │               * Mobile applies via system brightness API (if available) or overlay
    │   │               * User expects consistent brightness experience across devices
        │   │           
        │   │           **C. Kích thước Văn bản (Font Size):**
        │   │           - Access via 'Aa' icon in bottom menu
        │   │           - Implement in `ReadingPreferencesScreen.kt`:
        │   │             - `Slider` composable: 12-24sp range (default: 16sp)
        │   │             - Real-time preview: Update `remember { mutableStateOf() }` as user adjusts
    │   │             - Apply via Compose: `Text(..., fontSize = preferences.fontSize.sp)`
    │   │             - **Sync via Repository (CRITICAL - Cross-device sync):** 
    │   │               * Save to Room instantly (offline-first)
    │   │               * Sync to backend when online via `ReadingPreferencesRepository.kt`
    │   │               * Backend syncs to all other devices (web, iOS, desktop) via WebSocket events
    │   │               * Other devices receive real-time updates and update their local preferences
    │   │               * User expects same font size on all devices - sync is MANDATORY
        │   │           
        │   │           **D. Chế độ Đọc (Scroll vs Page Turn):**
        │   │           - Critical: Two distinct reading habits (users strongly prefer one or the other)
        │   │           - Implement in `StoryReaderScreen.kt`:
        │   │             - **Scroll Mode** (arrow up/down icon):
        │   │               - Use `LazyColumn` or `Column` with `Modifier.verticalScroll()`
        │   │               - Track scroll state: `val scrollState = rememberScrollState()`
        │   │               - Calculate reading progress from scroll position
        │   │             - **Page Turn Mode** (arrow left/right icon):
        │   │               - Use `HorizontalPager` (from `androidx.compose.foundation.pager`)
        │   │               - Or custom `Swipeable` modifier for swipe-to-turn
        │   │               - Page turn animation: `animateContentSize()` for smooth transitions
        │   │               - Calculate pages: Divide content height by viewport height
        │   │               - Track current page: `var currentPage by remember { mutableIntStateOf(0) }`
        │   │           - Toggle in `ReaderControls.kt`:
        │   │             - Two `IconButton`s: scroll (↑↓) and page (←→) with Material Icons
        │   │             - Active mode: Highlighted with `MaterialTheme.colorScheme.primary`
        │   │             - **Update via Repository (CRITICAL - Cross-device sync):**
    │   │               * Save to Room instantly (offline-first)
    │   │               * Sync to backend when online via `ReadingPreferencesRepository.kt`
    │   │               * Backend syncs to all other devices (web, iOS, desktop) via WebSocket events
    │   │               * Reading mode preference must sync - user expects same mode (scroll/page) on all devices
        │   │           
        │   │           **E. Implementation Details:**
        │   │           - **MVVM Pattern (Rule #5):**
        │   │             - ViewModel: `StoryReaderViewModel` (using `@HiltViewModel`) manages preferences state
        │   │             - Repository: `ReadingPreferencesRepository` handles sync (local Room + backend)
        │   │             - View: `StoryReaderScreen` composable displays content and handles gestures
        │   │           - **Offline-First (Rule #8):**
        │   │             - Load preferences from Room instantly
        │   │             - Sync to backend in background using `Flow` and `collectAsState`
        │   │             - Handle conflicts: Local wins, merge on next sync
        │   │           - **Types (Rule #3):**
        │   │             - Import `ReadingPreferences` from `7-shared` (via generated types or manual translation)
        │   │           - **State Management:**
        │   │             - Server state: Repository pattern (Room + GraphQL sync via Flow)
        │   │             - UI state: `remember { mutableStateOf() }` in Compose
        │   │           
        │   │           **F. Rules Compliance:**
        │   │           - Rule #3: Use `ReadingPreferences` type from `7-shared`
        │   │           - Rule #5: MVVM + Repository Pattern (mandatory for mobile)
        │   │           - Rule #8: Offline-first (load from Room first, sync in background)
        │   │           - Rule #27: DRM protection (use `FLAG_SECURE` to block screenshots for paid content)
    │   │           - **Content Interaction:**
    │   │             * **TTS/Narration (Enhanced):**
    │   │               - High-quality AI narration (free for ALL books)
    │   │               - Human narration (premium, for selected stories)
    │   │               - Speed control (0.5x - 2.0x), voice selection
    │   │               - Use `TextToSpeechManager` (see step 10 below)
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
    │   │               - Use `FLAG_SECURE` to block screenshots for paid content (not 100% reliable)
    │   │               - Balance: TTS provides audio access while blocking text access
          │   │           - **Library & Bookshelf Management (Enhanced - 2.1, 2.2, 2.3 - Core Feature with Cross-Device Sync):**
          │   │             * **Synchronization (CRITICAL - Rule #8 - Enhanced 2.3):**
          │   │               - **Cross-device sync:** All data must sync seamlessly across web, mobile, desktop
          │   │               - **Sync scope (Enhanced - 2.3):** Library items, bookshelves, tags, filtered views, system lists, wishlist, reading progress, bookmarks, annotations, reading preferences, download status
          │   │               - **Sync strategy:** Last-write-wins with timestamp comparison (same as backend)
          │   │               - **Offline-first (Rule #8):** Load from Room instantly, sync to backend in background
          │   │               - **Auto-sync:** Automatically sync on app start, when coming online, periodically in background
          │   │               - **Manual sync:** "Sync Now" button for manual sync trigger
          │   │               - **Real-time sync:** Listen to WebSocket events for real-time updates from other devices
          │   │               - **Conflict resolution:** Last-write-wins (newer timestamp wins), show conflict dialog if needed
          │   │               - **Sync status:** Show sync status indicator (synced, syncing, conflict, error)
          │   │               - **Implementation:** Use `SyncManager.kt` to orchestrate all syncs, each Repository handles its own sync logic
          │   │               - **Reading Preferences Sync (CRITICAL):** Must sync background mode, font size, reading mode, brightness across all devices
          │   │                 * When user changes preferences on Device A, it syncs to Device B immediately
          │   │                 * User expects same reading experience on all devices
          │   │                 * Store in Room database, sync via `ReadingPreferencesRepository.kt`
          │   │               - **Bookmark & Annotation Sync (CRITICAL - 2.3):**
          │   │                 * **CRITICAL:** Never lose bookmarks, highlights, notes - user's intellectual property
          │   │                 * Bookmark sync via `BookmarkSyncRepository.kt`
          │   │                 * Annotation sync via `AnnotationSyncRepository.kt`
          │   │                 * This is the strongest retention mechanism - data loss = immediate churn
          │   │             * **Auto-Organization (NEW - 2.1):**
          │   │               - Auto-grouping by author and series
          │   │               - System lists: Favorites, To Read, Have Read, Currently Reading, Recently Added
          │   │               - Implement in `LibraryAutoOrganizationScreen.kt`
          │   │             * **Organization (Enhanced - 2.1):**
          │   │               - **Virtual Bookshelves (Enhanced - 2.1):** Create multiple bookshelves to organize stories, implement in `BookshelfScreen.kt`
          │   │               - **Tags System (NEW - 2.1):**
          │   │                 * Hierarchical tags with colors and icons
          │   │                 * Tag management UI in `TagManagerScreen.kt`
          │   │                 * Tag selector for library items
          │   │               - **Filtered Views (NEW - 2.1):**
          │   │                 * Dynamic queries (tags, author, completion status, date ranges)
          │   │                 * Saved filter queries as virtual folders
          │   │                 * Query builder UI in `FilteredViewBuilderScreen.kt`
          │   │               - **Layouts:** Toggle between grid/list view, preferences synced across devices
          │   │               - **Sorting:** Sort by recent, title, progress, added date
          │   │               - **Filtering:** Filter by bookshelf, tags, completion status
          │   │               - **Search:** Search library by title or tags
          │   │             * **Download Management (NEW - 2.2):**
          │   │               - Download queue with progress tracking
          │   │               - Storage usage and cleanup
          │   │               - Auto-download settings
          │   │               - Implement in `DownloadManagerScreen.kt`
          │   │             * **Offline Download (Mobile-Specific - Enhanced 2.2):**
    │   │               - Download stories/chapters for offline reading, implement download manager with Room database storage
    │   │               - Premium chapters only downloaded if user has unlocked them
    │   │               - Download progress tracking, cancel download, delete downloaded content
    │   │               - Note: Downloaded content is device-local, but download status syncs across devices
    │   │             * **Tracking:**
    │   │               - Reading progress (chapter, position, WPM), wishlist, implement in `ReadingProgressRepository.kt`
    │   │               - Reading statistics, progress history, completion tracking
    │   │       10. **TTS (Text-to-Speech) Features:**
    │   │           - Create `tts/` package (organized TTS logic directory).
    │   │           - Create `TTSEngine.kt` (Interface) defining TTS contract.
    │   │           - Create `NativeTTSEngine.kt` (using `android.speech.tts.TextToSpeech` for Android native TTS).
    │   │           - Create `EmbeddedTTSEngine.kt` (using proprietary 60MB SDK for high-quality voices).
    │   │           - Create `TextToSpeechManager.kt` (main manager class that reads user settings and delegates to appropriate engine).
    │   │           - Use Hilt/Koin to provide (inject) `TextToSpeechManager` into ViewModels.
    │   │           - Create `SettingsViewModel.kt` to manage TTS settings.
    │   │           - Create `ui/settings/TTSSettingsScreen.kt` (Jetpack Compose UI for users to choose TTS engine and voice).
    │   │           - Update `StoryReaderViewModel.kt` to use injected `TextToSpeechManager`.
    │   │       11. **Discovery & Engagement Features (NEW):**
    │   │           - Create `repository/DiscoveryRepository.kt`:
    │   │             * `getRankings(rankingType, genre?, timeRange?)` -> GraphQL query
    │   │             * `getEditorPicks(limit?, genre?)` -> GraphQL query
    │   │             * `getGenreStories(genre, page?, limit?)` -> GraphQL query
    │   │             * Offline cache in Room database
    │   │           - Create `viewmodel/StorefrontViewModel.kt` and `RankingsViewModel.kt`
    │   │           - Create `ui/StorefrontScreen.kt` and `RankingsScreen.kt`
    │   │       12. **Recommendation Engine Integration (NEW):**
    │   │           - Create `repository/RecommendationsRepository.kt`:
    │   │             * `getRecommendations(userId, limit?)` -> GraphQL query
    │   │             * `getSimilarStories(storyId, limit?)` -> GraphQL query
    │   │             * Cache recommendations in Room database
    │   │           - Create `viewmodel/RecommendationsViewModel.kt`
    │   │           - Create `ui/RecommendationsScreen.kt`
    │   │           - Track user behavior (clicks, reading time) for recommendations
    │   │       13. **Community Interactions (NEW):** 🎯 **KILLER FEATURE - Duanping**
    │   │           - **Micro Level - Paragraph Comments (Duanping):** 🎯
    │   │             * **Repository:** `repository/CommunityRepository.kt`
    │   │               - Methods: `createParagraphComment()`, `getParagraphComments()`, `getParagraphCommentCounts()`, `likeParagraphComment()`, `replyToParagraphComment()`
    │   │               - WebSocket: Subscribe to `paragraph-comments:${chapterId}` for real-time updates
    │   │             * **ViewModel:** `viewmodel/ParagraphCommentsViewModel.kt`
    │   │               - State: comments, commentCounts (map of paragraphIndex -> count)
    │   │               - Methods: createComment, likeComment, replyToComment, deleteComment
    │   │               - Real-time: Updates state when WebSocket events received
    │   │             * **UI Components:**
    │   │               - `ParagraphCommentBubble.kt`: Bubble indicator on paragraph
    │   │                 * Position: Overlay on right side of paragraph
    │   │                 * Display: Comment count badge (e.g., "58")
    │   │                 * Real-time: Updates count via WebSocket
    │   │               - `ParagraphCommentPanel.kt`: Panel showing all comments
    │   │                 * Opens when bubble clicked (bottom sheet or navigation)
    │   │                 * Shows: Comment list, author interactions, quick reactions
    │   │               - `QuickReactionButtons.kt`: Quick reaction buttons
    │   │                 * Predefined reactions: 'like', 'laugh', 'cry', 'angry', 'wow', 'love'
    │   │               - `ParagraphCommentList.kt`: List of comments
    │   │                 * Sorted by: newest first, most liked first
    │   │                 * Shows: User avatar, content, reaction type, like count, author badges
    │   │             * **Integration into Reader:**
    │   │               - Overlay comment bubbles on paragraphs in `ReaderContent`
    │   │               - Click bubble to open `ParagraphCommentPanel`
    │   │               - Lazy load: Only fetch comments for visible paragraphs
    │   │               - Real-time updates via WebSocket
    │   │           - **Meso Level - Chapter Comments:**
    │   │             * Repository methods: `createChapterComment()`, `getChapterComments()`, `voteComment()`, `replyToComment()`
    │   │             * UI: `ChapterCommentsSection.kt` at end of chapter
    │   │           - **Macro Level - Reviews & Forums:**
    │   │             * Repository methods: `createReview()`, `getReviews()`, `createForumPost()`, `getForumPosts()`
    │   │             * UI: `ReviewsSection.kt`, `ForumSection.kt` on story detail page
    │   │           - **Platform Interactions - Polls & Quizzes:**
    │   │             * Repository methods: `createPoll()`, `votePoll()`, `createQuiz()`, `submitQuiz()`
    │   │             * UI: `PollCard.kt`, `QuizCard.kt` on story/home pages
    │   │       14. **Mobile-Specific Features (NEW):**
    │   │           - **Bulk Operations:**
    │   │             * Create `viewmodel/BulkOperationsViewModel.kt`
    │   │             * Create `ui/mobile/bulk-operations/` components
    │   │             * Implement multi-select with checkboxes, batch actions (delete, move, tag)
          │   │           - **Export/Import (Enhanced - from web):**
          │   │             * Create `repository/ExportImportRepository.kt`
          │   │             * Create `utils/mobile/export/` and `import/` utilities
          │   │             * Implement Share Intent integration for export
          │   │             * Support JSON, CSV, Markdown formats using Storage Access Framework
          │   │             * **Scheduled Exports:** Auto-export on schedule (daily, weekly) (NEW - from web)
          │   │               - Create `utils/mobile/export/ScheduledExportManager.kt`
          │   │               - Create `ui/mobile/export-import/ScheduledExportScreen.kt`
          │   │               - Background task scheduling using WorkManager
          │   │             * **Export History:** Track export history (NEW - from web)
          │   │               - Create `utils/mobile/export/ExportHistoryManager.kt`
          │   │               - Create `ui/mobile/export-import/ExportHistoryScreen.kt`
          │   │               - Store export records in Room database
          │   │           - **Advanced Search/Filter (Enhanced - from web):**
          │   │             * Create `repository/SearchRepository.kt`
          │   │             * Create `utils/mobile/search/` with AppSearch integration
          │   │             * Create `ui/mobile/advanced-search/` components
          │   │             * Implement saved filters, complex query builder
          │   │             * **Search History:** Track recent searches, quick access (NEW - from web)
          │   │               - Create `utils/mobile/search/SearchHistoryManager.kt`
          │   │               - Create `ui/mobile/advanced-search/SearchHistoryScreen.kt`
          │   │               - Store search history in Room database with timestamps
          │   │             * **Search Suggestions:** Auto-complete based on search history (NEW - from web)
          │   │               - Create `utils/mobile/search/SearchSuggestionsManager.kt`
          │   │               - Real-time suggestions as user types
          │   │               - Prioritize recent searches and popular queries
          │   │             * **Filter Presets:** Save frequently used filter combinations (NEW - from web)
          │   │               - Create `utils/mobile/search/FilterPresetsManager.kt`
          │   │               - Create `ui/mobile/advanced-search/FilterPresetsScreen.kt`
          │   │               - Save/load filter presets with names
          │   │           - **Command Palette (NEW - from web, mobile-optimized):**
          │   │             * Swipe down from top to open search overlay (Android native gesture)
          │   │             * Search stories, chapters, annotations, settings
          │   │             * Quick actions: Navigate, create, search
          │   │             * Keyboard shortcuts hints (for tablets with keyboard)
          │   │             * Create `viewmodel/CommandPaletteViewModel.kt`
          │   │             * Create `ui/mobile/command-palette/CommandPaletteScreen.kt`
          │   │             * Create `ui/mobile/command-palette/CommandPaletteResults.kt`
          │   │             * Integration: Use Material 3 SearchBar for native Android search experience
          │   │           - **Annotation Templates (NEW - from web):**
          │   │             * Save annotation templates for quick use
          │   │             * Template management (create, edit, delete)
          │   │             * Apply templates to new annotations
          │   │             * Create `viewmodel/AnnotationTemplatesViewModel.kt`
          │   │             * Create `ui/mobile/annotations/AnnotationTemplatesScreen.kt`
          │   │           - **Annotation Search (NEW - from web):**
          │   │             * Search within annotations (text, tags, dates)
          │   │             * Filter by story, chapter, annotation type
          │   │             * Full-text search with highlighting
          │   │             * Create `ui/mobile/annotations/AnnotationSearchScreen.kt`
          │   │           - **Annotation Export (NEW - from web):**
          │   │             * Export annotations as Markdown, PDF
          │   │             * Export to Notion, Obsidian, Capacities
          │   │             * Batch export with format selection
          │   │             * Create `ui/mobile/annotations/AnnotationExportScreen.kt`
          │   │           - **Reading Statistics:**
          │   │             * Create `repository/ReadingStatsRepository.kt`
          │   │             * Create `utils/mobile/stats/` for WPM calculation, time tracking
          │   │             * Create `ui/mobile/reading-stats/` with MPAndroidChart
          │   │           - **Enhanced Reader Features (Enhanced - from web):**
          │   │             * Multi-column reading view for tablets
          │   │             * Swipeable sidebar for notes/bookmarks
          │   │             * Advanced annotation editor with rich text
          │   │             * **Annotation Templates:** Save annotation templates for quick use (NEW - from web)
          │   │               - Save annotation templates (formatting, colors, tags)
          │   │               - Quick apply templates to new annotations
          │   │               - Template management UI
          │   │             * **Annotation Search:** Search within annotations (text, tags, dates) (NEW - from web)
          │   │               - Search annotations by text, tags, dates
          │   │               - Filter by story, chapter, annotation type
          │   │               - Full-text search with highlighting
          │   │             * **Annotation Export:** Export annotations as Markdown, PDF (NEW - from web)
          │   │               - Export annotations as Markdown, PDF
          │   │               - Export to Notion, Obsidian, Capacities
          │   │               - Batch export with format selection
    │   │             * Customizable layout presets
    │   │           - **Haptic Feedback:**
    │   │             * Create `utils/mobile/haptics/HapticManager.kt`
    │   │             * Add haptic feedback to key interactions (page turn, selection, etc.) using VibrationEffect
    │   │           - **Widget Support:**
    │   │             * Create App Widget for Home screen widgets
    │   │             * Display reading progress, recent stories
    │   │           - **Shortcuts Integration:**
    │   │             * Create App Shortcuts for quick actions (continue reading, open library)
    │   │           - **Share Extensions:**
    │   │             * Create ShareReceiver to import content from other apps
    │   │       15. **Monetization Features (NEW):**
    │   │           - **Virtual Currency (Wallet):**
    │   │             * Create `model/Wallet.kt`, `Transaction.kt`
    │   │             * Create `repository/WalletRepository.kt` with GraphQL queries
    │   │             * Create `viewmodel/WalletViewModel.kt`
    │   │             * Create `ui/monetization/WalletScreen.kt`, `TopUpScreen.kt`, `TransactionHistoryScreen.kt`
    │   │           - **Paywall System:**
    │   │             * Create `repository/PaywallRepository.kt`
    │   │             * Create `viewmodel/PaywallViewModel.kt`
    │   │             * Create `ui/monetization/PaywallScreen.kt`, `PurchaseDialogScreen.kt`
    │   │             * Integration: Show paywall in Reader when user reaches free chapter limit
    │   │           - **Subscriptions:**
    │   │             * Create `model/Subscription.kt`
    │   │             * Create `repository/SubscriptionRepository.kt`
    │   │             * Create `viewmodel/SubscriptionViewModel.kt`
    │   │             * Create `ui/monetization/SubscriptionPlansScreen.kt`, `SubscriptionManageScreen.kt`
    │   │             * Support: All-You-Can-Read and VIP Loyalty Program
    │   │       16. **Fan Economy Features (NEW):** 🎯 **Author Support System**
    │   │           - **Tipping (打赏):**
    │   │             * **Purpose:** Direct financial support to authors, gamified public recognition
    │   │             * **Model:** `model/Tip.kt` - Tip data model
    │   │             * **Repository:** `repository/TippingRepository.kt`
    │   │               - Methods: `tipAuthor()`, `getTippingHistory()`, `getAuthorTippingStats()`
    │   │             * **ViewModel:** `viewmodel/TippingViewModel.kt`
    │   │               - State: tips, tippingHistory, authorStats
    │   │               - Methods: submitTip, loadTippingHistory
    │   │             * **UI:** `ui/fan-economy/TippingScreen.kt`
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
    │   │             * **Model:** `model/Vote.kt` - Vote data model
    │   │             * **Repository:** `repository/VotesRepository.kt`
    │   │               - Methods: `voteForStory()`, `getVotesCount()`, `getVoteHistory()`
    │   │             * **ViewModel:** `viewmodel/VotesViewModel.kt`
    │   │               - State: votes, voteCount, voteHistory
    │   │               - Methods: castVote, loadVoteHistory
    │   │             * **UI:** `ui/fan-economy/VotesScreen.kt`
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
    │   │             * **Repository:** `repository/FanRankingsRepository.kt`
    │   │               - Methods: `getFanRankings()`, `getTopSupporters()`, `getUserRanking()`
    │   │             * **ViewModel:** `viewmodel/FanRankingsViewModel.kt`
    │   │               - State: rankings, topSupporters, userRanking
    │   │               - Methods: loadRankings, loadTopSupporters
    │   │             * **UI:** `ui/fan-economy/FanRankingsScreen.kt`
    │   │               - Leaderboard list with rank, user info, score
    │   │               - Filter by: story-specific, author-specific, all-time, monthly
    │   │               - Ranking badge component
    │   │             * **Integration:**
    │   │               - Fan rankings section on story detail page
    │   │               - Fan rankings section on author profile page
    │   │               - User's ranking badge in profile
    │   │           - **Author-Fan Interaction:**
    │   │             * **Purpose:** Direct communication between authors and fans
    │   │             * **Repository:** `repository/AuthorFanRepository.kt`
    │   │               - Methods: `getAuthorProfile()`, `getAuthorFanInteractions()`, `getFanAnalytics()` (author only)
    │   │             * **ViewModel:** `viewmodel/AuthorFanViewModel.kt`
    │   │               - State: authorProfile, interactions, analytics
    │   │             * **UI:** `ui/fan-economy/AuthorSupportScreen.kt`
    │   │               - Author profile with fan stats
    │   │               - Q&A sessions, author updates
    │   │               - Author analytics (author view)
    │   │           - **Gamification Loop:**
    │   │             * **Reward Cycle:** Tipping → Rankings → Votes → More readers → More tips
    │   │             * **UI Indicators:**
    │   │               - Show bonus votes granted from large tips
    │   │               - Highlight user's ranking position
    │   │               - Display gamification rewards (badges, status)
    │   │       17. **AI Service Features (NEW):**
    │   │           - **Translation:**
    │   │             * Create `model/Translation.kt`
    │   │             * Create `repository/TranslationRepository.kt`
    │   │             * Create `viewmodel/TranslationViewModel.kt`
    │   │             * Create `ui/ai/TranslationScreen.kt`
    │   │             * Integration: Translation in Reader (translate selected text)
    │   │           - **Summarization:**
    │   │             * Create `repository/SummarizationRepository.kt`
    │   │             * Create `viewmodel/SummarizationViewModel.kt`
    │   │             * Create `ui/ai/SummarizationScreen.kt`
    │   │       18. **Notification Features (NEW):**
    │   │           - Create `model/Notification.kt`
    │   │           - Create `repository/NotificationsRepository.kt`
    │   │           - Create `viewmodel/NotificationsViewModel.kt`
    │   │           - Create `ui/notifications/NotificationCenterScreen.kt`, `NotificationSettingsScreen.kt`
    │   │           - Real-time: WebSocket for real-time notifications
    │   │           - Push notifications: Integrate with Firebase Cloud Messaging (FCM)
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
