package com.storysphere.storyreader.ui.mobile.readerenhanced

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ReaderSidebarScreen(
    bookmarks: List<Any> = emptyList(),
    annotations: List<Any> = emptyList(),
    onBookmarkClick: (String) -> Unit = {},
    onAnnotationClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Text(
                text = "Notes & Bookmarks",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            // Bookmarks section
            Text(
                text = "Bookmarks",
                style = MaterialTheme.typography.titleSmall
            )
            LazyColumn {
                items(bookmarks) { bookmark ->
                    // Bookmark item
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Annotations section
            Text(
                text = "Annotations",
                style = MaterialTheme.typography.titleSmall
            )
            LazyColumn {
                items(annotations) { annotation ->
                    // Annotation item
                }
            }
        }
    }
}

