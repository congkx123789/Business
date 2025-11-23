package com.storysphere.storyreader.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.storysphere.storyreader.navigation.Screen
import com.storysphere.storyreader.ui.components.EmptyState
import com.storysphere.storyreader.ui.components.ErrorDisplay
import com.storysphere.storyreader.ui.components.HapticIconButton
import com.storysphere.storyreader.ui.components.HapticType
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.ui.components.hapticClickable
import com.storysphere.storyreader.utils.mobile.haptics.HapticManager
import com.storysphere.storyreader.viewmodel.LibraryViewModel

@Composable
fun LibraryScreen(
    viewModel: LibraryViewModel = hiltViewModel(),
    hapticManager: HapticManager? = null, // TODO: Inject via Hilt when available
    navController: NavController? = null,
    onNavigateToReader: (String) -> Unit = {},
    userId: String = "user1" // TODO: Get from AuthManager via Hilt injection
) {
    val libraryItems by viewModel.libraryItems.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadLibrary(userId)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Library") },
                actions = {
                    // Bulk Selection
                    HapticIconButton(
                        onClick = {
                        navController?.navigate(Screen.BulkSelection.route)
                        },
                        hapticManager = hapticManager,
                        hapticType = HapticType.SELECTION
                    ) {
                        Text("☑️")
                    }
                    // Export
                    HapticIconButton(
                        onClick = {
                        navController?.navigate(Screen.Export.route)
                        },
                        hapticManager = hapticManager,
                        hapticType = HapticType.ACTION
                    ) {
                        Text("📤")
                    }
                    // Import
                    HapticIconButton(
                        onClick = {
                        navController?.navigate(Screen.Import.route)
                        },
                        hapticManager = hapticManager,
                        hapticType = HapticType.ACTION
                    ) {
                        Text("📥")
                    }
                    // Advanced Search
                    HapticIconButton(
                        onClick = {
                        navController?.navigate(Screen.AdvancedSearch.route)
                        },
                        hapticManager = hapticManager,
                        hapticType = HapticType.SELECTION
                    ) {
                        Text("🔍")
                    }
                    // Bookshelf
                    HapticIconButton(
                        onClick = {
                        navController?.navigate(Screen.Bookshelf.route)
                        },
                        hapticManager = hapticManager,
                        hapticType = HapticType.SELECTION
                    ) {
                        Text("📚")
                    }
                    // Storefront
                    HapticIconButton(
                        onClick = {
                        navController?.navigate(Screen.Storefront.route)
                        },
                        hapticManager = hapticManager,
                        hapticType = HapticType.SELECTION
                    ) {
                        Text("🏪")
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> {
                LoadingIndicator(
                    modifier = Modifier.padding(padding)
                )
            }
            error != null -> {
                ErrorDisplay(
                    message = error ?: "Unknown error",
                    onRetry = {
                        hapticManager?.action()
                        viewModel.retry()
                    },
                    modifier = Modifier.padding(padding)
                )
            }
            libraryItems.isEmpty() -> {
                EmptyState(
                    title = "Your Library is Empty",
                    message = "Start reading by adding stories to your library",
                    actionLabel = "Discover Stories",
                    onAction = {
                        navController?.navigate(Screen.Storefront.route)
                    },
                    modifier = Modifier.padding(padding)
                )
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(libraryItems) { item ->
                        LibraryListItem(
                            item = item,
                            onClick = {
                                hapticManager?.action()
                                // TODO: Navigate to first chapter or last read chapter
                                onNavigateToReader("chapter1")
                            },
                            hapticManager = hapticManager
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun LibraryListItem(
    item: com.storysphere.storyreader.model.Library,
    onClick: () -> Unit = {},
    hapticManager: com.storysphere.storyreader.utils.mobile.haptics.HapticManager? = null
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .hapticClickable(
                hapticManager = hapticManager,
                hapticType = HapticType.ACTION,
                onClick = onClick
            ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Story ID: ${item.storyId}",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "Added: ${com.storysphere.storyreader.utils.DateUtils.formatRelativeTime(item.addedAt)}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
