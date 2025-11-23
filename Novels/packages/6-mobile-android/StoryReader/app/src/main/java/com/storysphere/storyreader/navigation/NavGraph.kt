package com.storysphere.storyreader.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.storysphere.storyreader.ui.BookshelfScreen
import com.storysphere.storyreader.ui.FeedScreen
import com.storysphere.storyreader.ui.GroupListScreen
import com.storysphere.storyreader.ui.LibraryScreen
import com.storysphere.storyreader.ui.NotificationsScreen
import com.storysphere.storyreader.ui.ReadingStatsScreen
import com.storysphere.storyreader.ui.StorefrontScreen
import com.storysphere.storyreader.ui.StoryReaderScreen
import com.storysphere.storyreader.ui.monetization.WalletScreen
import com.storysphere.storyreader.ui.auth.LoginScreen
import com.storysphere.storyreader.ui.settings.ReadingPreferencesScreen
import com.storysphere.storyreader.ui.settings.TTSSettingsScreen
import com.storysphere.storyreader.ui.mobile.bulkoperations.BulkSelectionScreen
import com.storysphere.storyreader.ui.mobile.exportimport.ExportScreen
import com.storysphere.storyreader.ui.mobile.exportimport.ImportScreen
import com.storysphere.storyreader.ui.mobile.advancedsearch.AdvancedSearchScreen
import com.storysphere.storyreader.ui.mobile.advancedsearch.SearchHistoryScreen
import com.storysphere.storyreader.ui.mobile.advancedsearch.FilterPresetsScreen
import com.storysphere.storyreader.ui.mobile.commandpalette.CommandPaletteScreen
import com.storysphere.storyreader.ui.mobile.readerenhanced.MultiColumnReaderScreen
import com.storysphere.storyreader.ui.mobile.readerenhanced.ReaderSidebarScreen
import com.storysphere.storyreader.ui.mobile.readerenhanced.AdvancedAnnotationEditor
import com.storysphere.storyreader.ui.mobile.readerenhanced.AnnotationTemplatesScreen
import com.storysphere.storyreader.ui.mobile.readerenhanced.AnnotationSearchScreen
import com.storysphere.storyreader.ui.mobile.readerenhanced.AnnotationExportScreen
import com.storysphere.storyreader.ui.community.platforminteractions.polls.PollList
import com.storysphere.storyreader.ui.community.platforminteractions.polls.PollVoting
import com.storysphere.storyreader.ui.community.platforminteractions.quizzes.QuizList
import com.storysphere.storyreader.ui.community.platforminteractions.quizzes.QuizInterface
import androidx.compose.ui.Modifier

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Library : Screen("library")
    object Bookshelf : Screen("bookshelf")
    object Storefront : Screen("storefront")
    object Feed : Screen("feed")
    object Groups : Screen("groups")
    object Notifications : Screen("notifications")
    object ReadingStats : Screen("reading_stats")
    object Wallet : Screen("wallet")
    object StoryReader : Screen("story_reader/{chapterId}") {
        fun createRoute(chapterId: String) = "story_reader/$chapterId"
    }
    object ReadingPreferences : Screen("reading_preferences")
    object TTSSettings : Screen("tts_settings")
    
    // Mobile-specific screens
    object BulkSelection : Screen("bulk_selection")
    object Export : Screen("export")
    object Import : Screen("import")
    object AdvancedSearch : Screen("advanced_search")
    object SearchHistory : Screen("search_history")
    object FilterPresets : Screen("filter_presets")
    object CommandPalette : Screen("command_palette")
    object MultiColumnReader : Screen("multi_column_reader/{chapterId}") {
        fun createRoute(chapterId: String) = "multi_column_reader/$chapterId"
    }
    object ReaderSidebar : Screen("reader_sidebar")
    object AdvancedAnnotationEditor : Screen("advanced_annotation_editor")
    object AnnotationTemplates : Screen("annotation_templates")
    object AnnotationSearch : Screen("annotation_search")
    object AnnotationExport : Screen("annotation_export")
    
    // Platform interactions
    object Polls : Screen("polls")
    object PollVoting : Screen("poll_voting/{pollId}") {
        fun createRoute(pollId: String) = "poll_voting/$pollId"
    }
    object Quizzes : Screen("quizzes")
    object QuizInterface : Screen("quiz_interface/{quizId}") {
        fun createRoute(quizId: String) = "quiz_interface/$quizId"
    }
}

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Library.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Library.route) {
            LibraryScreen(
                navController = navController,
                onNavigateToReader = { chapterId ->
                    navController.navigate(Screen.StoryReader.createRoute(chapterId))
                }
            )
        }
        
        composable(Screen.Bookshelf.route) {
            BookshelfScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Storefront.route) {
            StorefrontScreen(
                navController = navController,
                onNavigateToStory = { storyId ->
                    // TODO: Navigate to story detail or first chapter
                    navController.navigate(Screen.StoryReader.createRoute("chapter1"))
                }
            )
        }
        
        composable(
            route = Screen.StoryReader.route,
            arguments = listOf(
                navArgument("chapterId") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val chapterId = backStackEntry.arguments?.getString("chapterId") ?: ""
            StoryReaderScreen(
                chapterId = chapterId,
                onNavigateBack = {
                    navController.popBackStack()
                },
                navController = navController
            )
        }
        
        composable(Screen.ReadingPreferences.route) {
            ReadingPreferencesScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.TTSSettings.route) {
            TTSSettingsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Notifications.route) {
            NotificationsScreen(
                userId = "user1", // TODO: Get from AuthManager
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.ReadingStats.route) {
            ReadingStatsScreen(
                userId = "user1", // TODO: Get from AuthManager
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Wallet.route) {
            WalletScreen(
                userId = "user1", // TODO: Get from AuthManager
                onNavigateBack = {
                    navController.popBackStack()
                },
                onTopUp = {
                    // TODO: Navigate to top-up screen
                }
            )
        }
        
        composable(Screen.Feed.route) {
            FeedScreen(
                userId = "user1", // TODO: Get from AuthManager
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Groups.route) {
            GroupListScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onNavigateToGroup = { groupId ->
                    // TODO: Navigate to group detail
                }
            )
        }
        
        // Mobile-specific screens
        composable(Screen.BulkSelection.route) {
            BulkSelectionScreen(
                items = emptyList(), // TODO: Pass items from LibraryScreen
                onSelectionChanged = { /* Handle selection */ },
                onItemClick = { /* Handle item click */ }
            )
        }
        
        composable(Screen.Export.route) {
            ExportScreen(
                userId = "user1", // TODO: Get from AuthManager
                onExportComplete = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Import.route) {
            ImportScreen(
                userId = "user1", // TODO: Get from AuthManager
                fileUri = null, // TODO: Get from file picker
                onImportComplete = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.AdvancedSearch.route) {
            AdvancedSearchScreen(
                userId = "user1", // TODO: Get from AuthManager
                onSearch = { query ->
                    // TODO: Navigate to search results
                }
            )
        }
        
        composable(Screen.SearchHistory.route) {
            SearchHistoryScreen(
                userId = "user1", // TODO: Get from AuthManager
                onQuerySelected = { query ->
                    navController.popBackStack()
                    // TODO: Execute search with query
                }
            )
        }
        
        composable(Screen.FilterPresets.route) {
            FilterPresetsScreen(
                userId = "user1", // TODO: Get from AuthManager
                onPresetSelected = { presetId ->
                    navController.popBackStack()
                    // TODO: Apply filter preset
                }
            )
        }
        
        composable(Screen.CommandPalette.route) {
            CommandPaletteScreen(
                userId = "user1", // TODO: Get from AuthManager
                onCommandSelected = { result ->
                    // TODO: Navigate based on result type
                    when (result.type) {
                        com.storysphere.storyreader.ui.mobile.commandpalette.ResultType.STORY -> {
                            navController.navigate(Screen.StoryReader.createRoute(result.id))
                        }
                        // Handle other types
                        else -> {}
                    }
                },
                onDismiss = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(
            route = Screen.MultiColumnReader.route,
            arguments = listOf(
                navArgument("chapterId") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val chapterId = backStackEntry.arguments?.getString("chapterId") ?: ""
            MultiColumnReaderScreen(
                content = "", // TODO: Load chapter content
                columnCount = 2,
                modifier = androidx.compose.ui.Modifier.fillMaxSize()
            )
        }
        
        composable(Screen.ReaderSidebar.route) {
            ReaderSidebarScreen(
                bookmarks = emptyList(), // TODO: Load bookmarks
                annotations = emptyList(), // TODO: Load annotations
                onBookmarkClick = { /* Handle bookmark click */ },
                onAnnotationClick = { /* Handle annotation click */ }
            )
        }
        
        composable(Screen.AdvancedAnnotationEditor.route) {
            AdvancedAnnotationEditor(
                initialText = "", // TODO: Get from annotation if editing
                onSave = { text ->
                    // TODO: Save annotation
                    navController.popBackStack()
                },
                onCancel = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.AnnotationTemplates.route) {
            AnnotationTemplatesScreen(
                userId = "user1", // TODO: Get from AuthManager
                onTemplateSelected = { templateId ->
                    navController.popBackStack()
                    // TODO: Apply template
                }
            )
        }
        
        composable(Screen.AnnotationSearch.route) {
            AnnotationSearchScreen(
                annotations = emptyList(), // TODO: Load annotations
                onAnnotationClick = { annotationId ->
                    // TODO: Navigate to annotation
                }
            )
        }
        
        composable(Screen.AnnotationExport.route) {
            AnnotationExportScreen(
                onExport = { format, destination ->
                    // TODO: Export annotations
                    navController.popBackStack()
                },
                onCancel = {
                    navController.popBackStack()
                }
            )
        }
        
        // Platform interactions
        composable(Screen.Polls.route) {
            PollList(
                polls = emptyList(), // TODO: Load polls
                onPollClick = { pollId ->
                    navController.navigate(Screen.PollVoting.createRoute(pollId))
                }
            )
        }
        
        composable(
            route = Screen.PollVoting.route,
            arguments = listOf(
                navArgument("pollId") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val pollId = backStackEntry.arguments?.getString("pollId") ?: ""
            PollVoting(
                pollId = pollId,
                question = "", // TODO: Load poll data
                options = emptyList(), // TODO: Load poll options
                onVote = { pollId, optionId ->
                    // TODO: Submit vote
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Quizzes.route) {
            QuizList(
                quizzes = emptyList(), // TODO: Load quizzes
                onQuizClick = { quizId ->
                    navController.navigate(Screen.QuizInterface.createRoute(quizId))
                }
            )
        }
        
        composable(
            route = Screen.QuizInterface.route,
            arguments = listOf(
                navArgument("quizId") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val quizId = backStackEntry.arguments?.getString("quizId") ?: ""
            QuizInterface(
                quizId = quizId,
                questions = emptyList(), // TODO: Load quiz questions
                currentQuestionIndex = 0,
                onAnswerSelected = { answerId ->
                    // TODO: Store answer
                },
                onNext = {
                    // TODO: Move to next question
                },
                onSubmit = {
                    // TODO: Submit quiz
                    navController.popBackStack()
                }
            )
        }
    }
}

