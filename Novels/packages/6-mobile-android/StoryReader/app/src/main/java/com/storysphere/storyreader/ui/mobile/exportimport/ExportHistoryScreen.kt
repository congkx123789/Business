package com.storysphere.storyreader.ui.mobile.exportimport

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.ExportRecord
import com.storysphere.storyreader.viewmodel.ExportImportViewModel
import java.text.DateFormat

@Composable
fun ExportHistoryScreen(
    userId: String,
    viewModel: ExportImportViewModel = hiltViewModel()
) {
    val history by viewModel.exportHistory.collectAsState()

    LaunchedEffect(userId) {
        viewModel.observeHistory(userId)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        content = {
            items(history) { record ->
                ExportHistoryCard(record = record)
            }
        }
    )
}

@Composable
private fun ExportHistoryCard(record: ExportRecord) {
    val dateText = DateFormat.getDateTimeInstance().format(record.exportedAt)
    Card(
        modifier = Modifier
            .padding(bottom = 12.dp)
            .fillMaxSize()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(record.format.name, style = MaterialTheme.typography.titleMedium)
            Text(
                "Scope: ${record.scope.name}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                "Items: ${record.itemCount}  •  Size: ${formatSize(record.fileSizeBytes)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary
            )
            Text(
                "Exported: $dateText",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

private fun formatSize(bytes: Long): String {
    if (bytes <= 0) return "0 KB"
    val units = arrayOf("B", "KB", "MB", "GB")
    val digitGroups = (Math.log10(bytes.toDouble()) / Math.log10(1024.0)).toInt()
    return String.format("%.1f %s", bytes / Math.pow(1024.0, digitGroups.toDouble()), units[digitGroups])
}


