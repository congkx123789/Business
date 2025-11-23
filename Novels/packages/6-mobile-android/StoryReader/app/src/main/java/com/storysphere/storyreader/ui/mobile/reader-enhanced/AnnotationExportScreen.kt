package com.storysphere.storyreader.ui.mobile.readerenhanced

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ExportDestination
import com.storysphere.storyreader.model.ExportFormat

@Composable
fun AnnotationExportScreen(
    onExport: (ExportFormat, ExportDestination) -> Unit = {},
    onCancel: () -> Unit = {}
) {
    var selectedFormat by remember { mutableStateOf(ExportFormat.MARKDOWN) }
    var selectedDestination by remember { mutableStateOf(ExportDestination.FILE_SYSTEM) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Export Annotations",
            style = MaterialTheme.typography.titleLarge
        )

        // Format selection
        Text("Format")
        ExportFormat.values().forEach { format ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectable(
                        selected = selectedFormat == format,
                        onClick = { selectedFormat = format }
                    )
                    .padding(16.dp)
            ) {
                RadioButton(
                    selected = selectedFormat == format,
                    onClick = { selectedFormat = format }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(format.name)
            }
        }

        // Destination selection
        Text("Destination")
        ExportDestination.values().forEach { destination ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectable(
                        selected = selectedDestination == destination,
                        onClick = { selectedDestination = destination }
                    )
                    .padding(16.dp)
            ) {
                RadioButton(
                    selected = selectedDestination == destination,
                    onClick = { selectedDestination = destination }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(destination.name)
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(onClick = { onExport(selectedFormat, selectedDestination) }) {
                Text("Export")
            }
        }
    }
}

