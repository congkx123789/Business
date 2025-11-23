package com.storysphere.storyreader.ui

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.debounce
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.storysphere.storyreader.model.BackgroundMode
import com.storysphere.storyreader.model.ChapterComment
import com.storysphere.storyreader.model.ChapterCommentSort
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.model.ReviewRatings
import com.storysphere.storyreader.navigation.Screen
import com.storysphere.storyreader.viewmodel.StoryReaderViewModel
import com.storysphere.storyreader.viewmodel.CommunityViewModel
import com.storysphere.storyreader.ui.community.paragraphcomments.ParagraphCommentBubble
import com.storysphere.storyreader.ui.community.paragraphcomments.ParagraphCommentPanel
import com.storysphere.storyreader.ui.community.chaptercomments.ChapterCommentsSection
import com.storysphere.storyreader.ui.community.reviews.ReviewsSection
import com.storysphere.storyreader.ui.community.forums.ForumSection
import com.storysphere.storyreader.ui.components.AnnotationDialog
import com.storysphere.storyreader.ui.components.BookmarkDialog
import kotlinx.coroutines.delay

@Composable
fun StoryReaderScreen(
    chapterId: String,
    userId: String = "user1", // TODO: Get from AuthManager via Hilt injection
    viewModel: StoryReaderViewModel = hiltViewModel(),
    communityViewModel: CommunityViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {},
    navController: NavController? = null
) {
    val chapter by viewModel.chapter.collectAsState()
    val readingPreferences by viewModel.readingPreferences.collectAsState()
    val showControls by viewModel.showControls.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val brightness by viewModel.userBrightness.collectAsState()
    val bookmarks by viewModel.bookmarks.collectAsState()
    val showBookmarkDialog by viewModel.showBookmarkDialog.collectAsState()
    val annotationDialogState by viewModel.annotationDialogState.collectAsState()
    val annotations by viewModel.annotations.collectAsState()
    val chapterList by viewModel.chapterList.collectAsState()
    val paragraphComments by communityViewModel.paragraphComments.collectAsState()
    val commentCounts by communityViewModel.commentCounts.collectAsState()
    val chapterComments by communityViewModel.chapterComments.collectAsState()
    val chapterCommentSort by communityViewModel.chapterCommentSortState.collectAsState()
    val reviews by communityViewModel.reviews.collectAsState()
    val forumThreads by communityViewModel.forumThreads.collectAsState()
    val isCommunityLoading by communityViewModel.isLoading.collectAsState()
    var activeParagraphIndex by remember(chapterId) { mutableStateOf<Int?>(null) }
    
    LaunchedEffect(chapterId) {
        viewModel.loadChapter(chapterId)
        viewModel.loadReadingPreferences(userId)
        communityViewModel.bindChapter(chapterId)
        activeParagraphIndex = null
    }

    LaunchedEffect(chapter?.id) {
        val dynamicChapterId = chapter?.id ?: return@LaunchedEffect
        communityViewModel.bindChapter(dynamicChapterId)
    }

    LaunchedEffect(chapter?.storyId) {
        val storyId = chapter?.storyId ?: return@LaunchedEffect
        communityViewModel.bindStory(storyId)
    }
    
    // Auto-hide controls
    LaunchedEffect(showControls) {
        if (showControls && readingPreferences?.autoHideControls == true) {
            delay(readingPreferences?.controlsTimeout ?: 3000L)
            viewModel.toggleControls()
        }
    }
    
    val backgroundColor = when (readingPreferences?.backgroundColor) {
        BackgroundMode.WHITE -> Color.White
        BackgroundMode.BLACK -> Color.Black
        BackgroundMode.SEPIA -> Color(0xFFF4E4BC)
        BackgroundMode.EYE_PROTECTION -> Color(0xFFFFF9C4)
        BackgroundMode.CUSTOM -> readingPreferences?.customBackgroundColor?.let { 
            Color(android.graphics.Color.parseColor(it))
        } ?: Color.White
        else -> Color.White
    }
    
    val fontSize = readingPreferences?.fontSize?.sp ?: 16.sp
    val readingMode = readingPreferences?.readingMode ?: ReadingMode.SCROLL
    val onSubmitChapterComment: (String) -> Unit = { content ->
        val targetChapterId = chapter?.id ?: chapterId
        val story = chapter?.storyId
        if (story != null) {
            communityViewModel.submitChapterComment(
                chapterId = targetChapterId,
                storyId = story,
                content = content
            )
        }
    }

    val onVoteChapterComment: (String, Boolean) -> Unit = { commentId, isUpvote ->
        communityViewModel.voteChapterComment(commentId, isUpvote)
    }

    val onSubmitReview: (String, ReviewRatings) -> Unit = { content, ratings ->
        val story = chapter?.storyId
        if (story != null) {
            communityViewModel.submitReview(story, content, ratings)
        }
    }

    val onVoteReviewHelpful: (String, Boolean) -> Unit = { reviewId, helpful ->
        communityViewModel.voteReviewHelpful(reviewId, helpful)
    }

    val onCreateForumThread: (String, String) -> Unit = { title, body ->
        val story = chapter?.storyId
        if (story != null) {
            communityViewModel.createForumThread(story, title, body, null)
        }
    }

    val onReplyForumThread: (com.storysphere.storyreader.model.ForumThread, String) -> Unit =
        { thread, content ->
            communityViewModel.replyToForumThread(thread.id, content)
        }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundColor)
    ) {
        // Main content area
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(readingPreferences) {
                    detectTapGestures(
                        onTap = { viewModel.toggleControls(readingPreferences) }
                    )
                }
                .pointerInput(Unit) {
                    detectVerticalDragGestures { change, dragAmount ->
                        // Swipe down to open command palette
                        if (dragAmount < -100) {
                            navController?.navigate(Screen.CommandPalette.route)
                        }
                    }
                }
        ) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                chapter == null -> {
                    Text(
                        text = "Chapter not found",
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                else -> {
                    when (readingMode) {
                        ReadingMode.SCROLL -> {
                            ScrollReaderContent(
                                chapter = chapter!!,
                                fontSize = fontSize,
                                backgroundColor = backgroundColor,
                                paragraphCommentCounts = commentCounts,
                                onParagraphSelected = { index ->
                                    activeParagraphIndex = index
                                    communityViewModel.openParagraphThread(chapterId, index)
                                },
                                chapterComments = chapterComments,
                                chapterCommentSort = chapterCommentSort,
                                onChapterCommentSortChange = { communityViewModel.setChapterCommentSort(it) },
                                onSubmitChapterComment = onSubmitChapterComment,
                                onVoteChapterComment = onVoteChapterComment,
                                reviews = reviews,
                                onSubmitReview = onSubmitReview,
                                onVoteReviewHelpful = onVoteReviewHelpful,
                                forumThreads = forumThreads,
                                onCreateForumThread = onCreateForumThread,
                                onReplyForumThread = onReplyForumThread,
                                onScrollChange = { position, progress ->
                                    // Update reading progress (debounced in ViewModel)
                                    chapter?.let { ch ->
                                        viewModel.updateReadingProgress(
                                            userId = userId,
                                            storyId = ch.storyId,
                                            chapterId = ch.id,
                                            position = position,
                                            progress = progress
                                        )
                                    }
                                }
                            )
                        }
                        ReadingMode.PAGE_TURN -> {
                            PageReaderContent(
                                chapter = chapter!!,
                                fontSize = fontSize,
                                chapterComments = chapterComments,
                                chapterCommentSort = chapterCommentSort,
                                onChapterCommentSortChange = { communityViewModel.setChapterCommentSort(it) },
                                onSubmitChapterComment = onSubmitChapterComment,
                                onVoteChapterComment = onVoteChapterComment,
                                reviews = reviews,
                                onSubmitReview = onSubmitReview,
                                onVoteReviewHelpful = onVoteReviewHelpful,
                                forumThreads = forumThreads,
                                onCreateForumThread = onCreateForumThread,
                                onReplyForumThread = onReplyForumThread,
                                onPageChange = { position, progress ->
                                    chapter?.let { ch ->
                                        viewModel.updateReadingProgress(
                                            userId = userId,
                                            storyId = ch.storyId,
                                            chapterId = ch.id,
                                            position = position,
                                            progress = progress
                                        )
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }

        // Brightness overlay
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Color.Black.copy(
                        alpha = (1f - brightness).coerceIn(0f, 0.85f)
                    )
                )
        )
        
        // Top bar (when controls are shown)
        if (showControls) {
            TopAppBar(
                title = { Text(chapter?.title ?: "Reading") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Text("←")
                    }
                },
                actions = {
                    // Multi-column reader
                    IconButton(onClick = {
                        chapter?.id?.let { chapterId ->
                            navController?.navigate(Screen.MultiColumnReader.createRoute(chapterId))
                        }
                    }) {
                        Text("📄")
                    }
                    // Reader sidebar
                    IconButton(onClick = {
                        navController?.navigate(Screen.ReaderSidebar.route)
                    }) {
                        Text("📋")
                    }
                    // Annotation templates
                    IconButton(onClick = {
                        navController?.navigate(Screen.AnnotationTemplates.route)
                    }) {
                        Text("📝")
                    }
                    // Search annotations
                    IconButton(onClick = {
                        navController?.navigate(Screen.AnnotationSearch.route)
                    }) {
                        Text("🔎")
                    }
                    // Export annotations
                    IconButton(onClick = {
                        navController?.navigate(Screen.AnnotationExport.route)
                    }) {
                        Text("💾")
                    }
                    // Reading preferences
                    IconButton(onClick = {
                        navController?.navigate(Screen.ReadingPreferences.route)
                    }) {
                        Text("⚙️")
                    }
                },
                modifier = Modifier.align(Alignment.TopCenter)
            )
        }

        // Chapter progress & navigation
        chapter?.let { currentChapter ->
            val totalChapters = chapterList.size
            val currentIndex = chapterList.indexOfFirst { it.id == currentChapter.id } + 1
            val progress = if (totalChapters > 0) currentIndex.toFloat() / totalChapters else 0f

            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(bottom = if (showControls) 220.dp else 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                LinearProgressIndicator(
                    progress = progress,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 32.dp)
                )
                Text(
                    text = "Chapter $currentIndex / $totalChapters",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 4.dp)
                )
                ChapterNavigationBar(
                    hasPrevious = currentIndex > 1,
                    hasNext = currentIndex < totalChapters,
                    onPrevious = { viewModel.goToPreviousChapter(userId) },
                    onNext = { viewModel.goToNextChapter(userId) },
                    onChapterList = {
                        // TODO: open chapter list sheet
                    },
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }
        
        // Controls overlay
        if (showControls) {
            ReaderControls(
                readingPreferences = readingPreferences,
                isTTSPlaying = viewModel.isTTSPlaying(),
                onFontSizeChange = { viewModel.updateFontSize(it) },
                onReadingModeChange = { viewModel.updateReadingMode(it) },
                onBackgroundChange = { viewModel.updateBackgroundMode(it) },
                onBrightnessChange = { viewModel.updateBrightness(it) },
                bookmarks = bookmarks,
                onAddBookmark = { viewModel.openBookmarkDialog() },
                onDeleteBookmark = { bookmarkId ->
                    viewModel.deleteBookmark(bookmarkId, userId)
                },
                onAddAnnotation = { selected ->
                    viewModel.openAnnotationDialog(selected)
                },
                onTTSPlay = { viewModel.startTTS() },
                onTTSStop = { viewModel.stopTTS() },
                onTTSPause = { viewModel.pauseTTS() },
                onTTSResume = { viewModel.resumeTTS() },
                onTTSSpeedChange = { viewModel.setTTSSpeed(it) },
                modifier = Modifier.align(Alignment.BottomCenter)
            )
        }

        if (showBookmarkDialog) {
            BookmarkDialog(
                onDismiss = { viewModel.closeBookmarkDialog() },
                onConfirm = { note ->
                    viewModel.createBookmark(userId, note)
                    viewModel.closeBookmarkDialog()
                }
            )
        }

        if (annotationDialogState.first) {
            AnnotationDialog(
                selectedText = annotationDialogState.second.orEmpty(),
                onDismiss = { viewModel.closeAnnotationDialog() },
                onConfirm = { note, color, _ ->
                    viewModel.createAnnotation(userId, annotationDialogState.second.orEmpty(), note, color)
                    viewModel.closeAnnotationDialog()
                }
            )
        }

        activeParagraphIndex?.let { paragraphIndex ->
            ParagraphCommentPanel(
                paragraphIndex = paragraphIndex,
                comments = paragraphComments[paragraphIndex].orEmpty(),
                isLoading = isCommunityLoading,
                onDismiss = { activeParagraphIndex = null },
                onSubmitComment = { text ->
                    communityViewModel.createParagraphComment(
                        chapterId = chapterId,
                        paragraphIndex = paragraphIndex,
                        content = text
                    )
                },
                onReactionSelected = { reaction ->
                    communityViewModel.createParagraphComment(
                        chapterId = chapterId,
                        paragraphIndex = paragraphIndex,
                        content = reaction.emoji,
                        reactionType = reaction
                    )
                },
                onLike = { commentId ->
                    communityViewModel.likeParagraphComment(commentId)
                }
            )
        }
    }
}

@Composable
fun ScrollReaderContent(
    chapter: com.storysphere.storyreader.model.Chapter,
    fontSize: androidx.compose.ui.unit.TextUnit,
    backgroundColor: Color,
    paragraphCommentCounts: Map<Int, Int>,
    onParagraphSelected: (Int) -> Unit,
    chapterComments: List<ChapterComment>,
    chapterCommentSort: ChapterCommentSort,
    onChapterCommentSortChange: (ChapterCommentSort) -> Unit,
    onSubmitChapterComment: (String) -> Unit,
    onVoteChapterComment: (String, Boolean) -> Unit,
    reviews: List<com.storysphere.storyreader.model.Review>,
    onSubmitReview: (String, ReviewRatings) -> Unit,
    onVoteReviewHelpful: (String, Boolean) -> Unit,
    forumThreads: List<com.storysphere.storyreader.model.ForumThread>,
    onCreateForumThread: (String, String) -> Unit,
    onReplyForumThread: (com.storysphere.storyreader.model.ForumThread, String) -> Unit,
    onScrollChange: ((Int, Float) -> Unit)? = null
) {
    val scrollState = rememberScrollState()
    
    // Track scroll position for reading progress (debounced to avoid excessive updates)
    LaunchedEffect(scrollState) {
        snapshotFlow { scrollState.value to scrollState.maxValue }
            .debounce(500) // Debounce 500ms
            .distinctUntilChanged()
            .collect { (currentScroll, maxScroll) ->
                if (maxScroll > 0) {
                    val progress = currentScroll.toFloat() / maxScroll.toFloat()
                    onScrollChange?.invoke(currentScroll, progress)
                }
            }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Text(
            text = chapter.title,
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        val paragraphs = remember(chapter.id) {
            chapter.content
                ?.split("\n")
                ?.filter { it.isNotBlank() }
                ?: emptyList()
        }

        paragraphs.forEachIndexed { index, paragraph ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.Top
            ) {
        Text(
                    text = paragraph,
            style = TextStyle(fontSize = fontSize),
                    color = if (backgroundColor == Color.Black) Color.White else Color.Black,
                    modifier = Modifier.weight(1f)
                )
                ParagraphCommentBubble(
                    count = paragraphCommentCounts[index] ?: 0,
                    onClick = { onParagraphSelected(index) }
                )
            }
        }

        ChapterCommentsSection(
            comments = chapterComments,
            selectedSort = chapterCommentSort,
            onSortChange = onChapterCommentSortChange,
            onVote = onVoteChapterComment,
            onSubmit = onSubmitChapterComment,
            modifier = Modifier.fillMaxWidth()
        )
        ReviewsSection(
            reviews = reviews,
            onVote = onVoteReviewHelpful,
            onSubmit = onSubmitReview,
            modifier = Modifier.fillMaxWidth()
        )
        ForumSection(
            threads = forumThreads,
            onReply = onReplyForumThread,
            onCreateThread = onCreateForumThread,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun PageReaderContent(
    chapter: com.storysphere.storyreader.model.Chapter,
    fontSize: androidx.compose.ui.unit.TextUnit,
    chapterComments: List<ChapterComment>,
    chapterCommentSort: ChapterCommentSort,
    onChapterCommentSortChange: (ChapterCommentSort) -> Unit,
    onSubmitChapterComment: (String) -> Unit,
    onVoteChapterComment: (String, Boolean) -> Unit,
    reviews: List<com.storysphere.storyreader.model.Review>,
    onSubmitReview: (String, ReviewRatings) -> Unit,
    onVoteReviewHelpful: (String, Boolean) -> Unit,
    forumThreads: List<com.storysphere.storyreader.model.ForumThread>,
    onCreateForumThread: (String, String) -> Unit,
    onReplyForumThread: (com.storysphere.storyreader.model.ForumThread, String) -> Unit,
    onPageChange: (Int, Float) -> Unit
) {
    val content = remember(chapter.id) { chapter.content ?: "" }
    val pages = remember(content) { paginateContent(content) }
    val pagerState = rememberPagerState(initialPage = 0, pageCount = { pages.size })

    LaunchedEffect(pagerState) {
        snapshotFlow { pagerState.currentPage to pages.size }
            .distinctUntilChanged()
            .collect { (page, total) ->
                if (total > 0) {
                    val progress = page.toFloat() / total.toFloat()
                    onPageChange(page, progress)
                }
            }
    }

    Column(modifier = Modifier.fillMaxSize()) {
    HorizontalPager(
        state = pagerState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
    ) { page ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = pages[page],
                style = TextStyle(fontSize = fontSize)
            )
        }
        }
        ChapterCommentsSection(
            comments = chapterComments,
            selectedSort = chapterCommentSort,
            onSortChange = onChapterCommentSortChange,
            onVote = onVoteChapterComment,
            onSubmit = onSubmitChapterComment,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        )
        ReviewsSection(
            reviews = reviews,
            onVote = onVoteReviewHelpful,
            onSubmit = onSubmitReview,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        )
        ForumSection(
            threads = forumThreads,
            onReply = onReplyForumThread,
            onCreateThread = onCreateForumThread,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        )
    }
}

private fun paginateContent(content: String, chunkSize: Int = 1200): List<String> {
    if (content.isEmpty()) return listOf("Content not available")
    val result = mutableListOf<String>()
    var index = 0
    while (index < content.length) {
        val end = (index + chunkSize).coerceAtMost(content.length)
        result.add(content.substring(index, end))
        index = end
    }
    return result
}

@Composable
fun ReaderControls(
    readingPreferences: com.storysphere.storyreader.model.ReadingPreferences?,
    isTTSPlaying: Boolean = false,
    onFontSizeChange: (Int) -> Unit,
    onReadingModeChange: (ReadingMode) -> Unit,
    onBackgroundChange: (BackgroundMode) -> Unit,
    onBrightnessChange: (Int) -> Unit,
    bookmarks: List<com.storysphere.storyreader.model.Bookmark>,
    onAddBookmark: () -> Unit,
    onDeleteBookmark: (String) -> Unit,
    onAddAnnotation: (String) -> Unit,
    onTTSPlay: () -> Unit = {},
    onTTSStop: () -> Unit = {},
    onTTSPause: () -> Unit = {},
    onTTSResume: () -> Unit = {},
    onTTSSpeedChange: (Float) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Font size control
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Font Size")
                Slider(
                    value = (readingPreferences?.fontSize ?: 16).toFloat(),
                    onValueChange = { onFontSizeChange(it.toInt()) },
                    valueRange = 12f..24f,
                    modifier = Modifier.weight(1f)
                )
                Text("${readingPreferences?.fontSize ?: 16}sp")
            }
            
            // Reading mode toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { onReadingModeChange(ReadingMode.SCROLL) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (readingPreferences?.readingMode == ReadingMode.SCROLL) 
                            MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Text("Scroll")
                }
                Button(
                    onClick = { onReadingModeChange(ReadingMode.PAGE_TURN) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (readingPreferences?.readingMode == ReadingMode.PAGE_TURN) 
                            MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Text("Page Turn")
                }
            }
            
            // Background mode
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BackgroundModeButton(BackgroundMode.WHITE, onBackgroundChange)
                BackgroundModeButton(BackgroundMode.BLACK, onBackgroundChange)
                BackgroundModeButton(BackgroundMode.SEPIA, onBackgroundChange)
                BackgroundModeButton(BackgroundMode.EYE_PROTECTION, onBackgroundChange)
            }

            // Brightness control
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Brightness")
                Slider(
                    value = (readingPreferences?.brightness ?: 50).toFloat(),
                    onValueChange = { onBrightnessChange(it.toInt()) },
                    valueRange = 0f..100f,
                    modifier = Modifier.weight(1f)
                )
            }

            Divider(modifier = Modifier.padding(vertical = 8.dp))

            // Bookmarks shortcut
            Text("Bookmarks", style = MaterialTheme.typography.titleSmall)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Bookmarks: ${bookmarks.size}")
                Button(onClick = onAddBookmark) {
                    Text("Add Bookmark")
                }
            }

            if (bookmarks.isNotEmpty()) {
                bookmarks.take(3).forEach { bookmark ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(bookmark.note ?: "Bookmark")
                            Text(
                                text = "Saved at ${bookmark.createdAt}",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        IconButton(onClick = { onDeleteBookmark(bookmark.id) }) {
                            Icon(
                                imageVector = androidx.compose.material.icons.Icons.Default.Delete,
                                contentDescription = "Delete bookmark"
                            )
                        }
                    }
                }
            }

            // Placeholder button for annotation (would be triggered via text selection)
            Button(
                onClick = { onAddAnnotation("Sample selection") }
            ) {
                Text("Annotate Selection")
            }
            
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            
            // TTS Controls
            Text("Text-to-Speech", style = MaterialTheme.typography.titleSmall)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (isTTSPlaying) {
                    Button(onClick = onTTSPause) {
                        Text("Pause")
                    }
                    Button(onClick = onTTSStop) {
                        Text("Stop")
                    }
                } else {
                    Button(onClick = onTTSPlay) {
                        Text("Play")
                    }
                    Button(onClick = onTTSResume) {
                        Text("Resume")
                    }
                }
            }
            
            // TTS Speed
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("TTS Speed")
                Slider(
                    value = 1.0f,
                    onValueChange = onTTSSpeedChange,
                    valueRange = 0.5f..2.0f,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun BackgroundModeButton(
    mode: BackgroundMode,
    onClick: (BackgroundMode) -> Unit
) {
    Button(
        onClick = { onClick(mode) },
        modifier = Modifier.weight(1f)
    ) {
        Text(mode.name)
    }
}

