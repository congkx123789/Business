package com.storysphere.storyreader.ui.mobile.exportimport

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.ExportDestination
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportScope
import com.storysphere.storyreader.viewmodel.ExportImportViewModel

@Composable
fun ExportScreen(
    userId: String,
    viewModel: ExportImportViewModel = hiltViewModel(),
    onExportComplete: () -> Unit = {}
) {
    var selectedFormat by remember { mutableStateOf(ExportFormat.JSON) }
    var selectedScope by remember { mutableStateOf(ExportScope.LIBRARY) }
    var selectedDestination by remember { mutableStateOf(ExportDestination.FILE_SYSTEM) }

    val isExporting by viewModel.isExporting.collectAsState()
    val exportProgress by viewModel.exportProgress.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Export Data") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Format Selection
            Text(
                text = "Export Format",
                style = MaterialTheme.typography.titleMedium
            )
            ExportFormat.values().forEach { format ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(
                            selected = selectedFormat == format,
                            onClick = { selectedFormat = format }
                        )
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedFormat == format,
                        onClick = { selectedFormat = format }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(format.name)
                }
            }

            // Scope Selection
            Text(
                text = "Export Scope",
                style = MaterialTheme.typography.titleMedium
            )
            ExportScope.values().forEach { scope ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(
                            selected = selectedScope == scope,
                            onClick = { selectedScope = scope }
                        )
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedScope == scope,
                        onClick = { selectedScope = scope }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(scope.name)
                }
            }

            // Destination Selection
            Text(
                text = "Export Destination",
                style = MaterialTheme.typography.titleMedium
            )
            ExportDestination.values().forEach { destination ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(
                            selected = selectedDestination == destination,
                            onClick = { selectedDestination = destination }
                        )
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedDestination == destination,
                        onClick = { selectedDestination = destination }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(destination.name)
                }
            }

            // Progress Indicator
            if (isExporting) {
                Column {
                    LinearProgressIndicator(
                        progress = exportProgress,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Exporting... ${(exportProgress * 100).toInt()}%",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }

            // Export Button
            Button(
                onClick = {
                    viewModel.exportNow(userId, selectedFormat, selectedScope, selectedDestination)
                    onExportComplete()
                },
                enabled = !isExporting,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isExporting) "Exporting..." else "Export Now")
            }
        }
    }
}

