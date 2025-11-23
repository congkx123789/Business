package com.storysphere.storyreader.ui.mobile.readerenhanced

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MultiColumnReaderScreen(
    content: String,
    columnCount: Int = 2,
    modifier: Modifier = Modifier
) {
    // For tablets - multi-column newspaper-style layout
    Row(
        modifier = modifier.fillMaxSize(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        repeat(columnCount) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = content,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }
    }
}

