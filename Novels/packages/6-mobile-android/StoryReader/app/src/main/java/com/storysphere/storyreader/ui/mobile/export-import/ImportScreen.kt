package com.storysphere.storyreader.ui.mobile.exportimport

import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.viewmodel.ExportImportViewModel

@Composable
fun ImportScreen(
    userId: String,
    fileUri: Uri? = null,
    viewModel: ExportImportViewModel = hiltViewModel(),
    onImportComplete: () -> Unit = {}
) {
    val isImporting by viewModel.isImporting.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Import Data") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (isImporting) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text("Importing data...")
            } else {
                Text(
                    text = "Select a file to import",
                    style = MaterialTheme.typography.titleMedium
                )

                Text(
                    text = "Supported formats: JSON, CSV, Markdown",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        // In production, use ActivityResultLauncher to pick file
                        // For now, if fileUri is provided, import it
                        fileUri?.let {
                            viewModel.importData(userId, it.toString())
                            onImportComplete()
                        }
                    },
                    enabled = fileUri != null,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Import from File")
                }
            }
        }
    }
}

