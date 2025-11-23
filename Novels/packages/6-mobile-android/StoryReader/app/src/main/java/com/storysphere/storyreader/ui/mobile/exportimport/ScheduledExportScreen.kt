package com.storysphere.storyreader.ui.mobile.exportimport

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberTopAppBarState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportFrequency
import com.storysphere.storyreader.viewmodel.ExportImportViewModel
import kotlinx.coroutines.flow.collectLatest

@Composable
fun ScheduledExportScreen(
    userId: String,
    viewModel: ExportImportViewModel = hiltViewModel()
) {
    val scheduleState by viewModel.scheduleState.collectAsState()
    var selectedFrequency by remember(scheduleState) { mutableStateOf(scheduleState?.frequency ?: ExportFrequency.WEEKLY) }
    var includeAnnotations by remember(scheduleState) { mutableStateOf(scheduleState?.includeAnnotations ?: true) }
    var includeProgress by remember(scheduleState) { mutableStateOf(scheduleState?.includeProgress ?: true) }
    var selectedFormat by remember(scheduleState) { mutableStateOf(scheduleState?.format ?: ExportFormat.JSON) }

    LaunchedEffect(userId) {
        viewModel.messages.collectLatest { /* Hook up to snackbar host in parent */ }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            ScheduleSummaryCard(scheduleState)
        }
        item {
            FrequencySelector(selectedFrequency) { selectedFrequency = it }
        }
        item {
            IncludeSection(
                includeAnnotations = includeAnnotations,
                includeProgress = includeProgress,
                onAnnotationsChange = { includeAnnotations = it },
                onProgressChange = { includeProgress = it }
            )
        }
        item {
            FormatSelector(selectedFormat) { selectedFormat = it }
        }
        item {
            ActionButtons(
                hasSchedule = scheduleState != null,
                onSchedule = {
                    viewModel.scheduleExport(
                        userId = userId,
                        frequency = selectedFrequency,
                        includeAnnotations = includeAnnotations,
                        includeProgress = includeProgress,
                        format = selectedFormat
                    )
                },
                onCancel = { viewModel.cancelSchedule() }
            )
        }
    }
}

@Composable
private fun ScheduleSummaryCard(schedule: com.storysphere.storyreader.model.ExportSchedule?) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Current schedule", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            if (schedule == null) {
                Text("No scheduled exports yet.", color = MaterialTheme.colorScheme.secondary)
            } else {
                Text("Frequency: ${schedule.frequency.name.lowercase().replaceFirstChar { it.uppercase() }}")
                Text("Format: ${schedule.format.name}")
                Text("Includes annotations: ${if (schedule.includeAnnotations) "Yes" else "No"}")
                Text("Includes reading progress: ${if (schedule.includeProgress) "Yes" else "No"}")
            }
        }
    }
}

@Composable
private fun FrequencySelector(
    selected: ExportFrequency,
    onSelected: (ExportFrequency) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Frequency", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            ExportFrequency.values().forEach { frequency ->
                FrequencyRow(
                    label = frequency.name.lowercase().replaceFirstChar { it.uppercase() },
                    selected = frequency == selected,
                    onClick = { onSelected(frequency) }
                )
            }
        }
    }
}

@Composable
private fun FrequencyRow(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    androidx.compose.foundation.layout.Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(
                selected = selected,
                onClick = onClick,
                role = Role.RadioButton
            )
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label)
        RadioButton(selected = selected, onClick = onClick)
    }
}

@Composable
private fun IncludeSection(
    includeAnnotations: Boolean,
    includeProgress: Boolean,
    onAnnotationsChange: (Boolean) -> Unit,
    onProgressChange: (Boolean) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Include", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            ToggleRow("Annotations", includeAnnotations, onAnnotationsChange)
            ToggleRow("Reading progress", includeProgress, onProgressChange)
        }
    }
}

@Composable
private fun ToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    androidx.compose.foundation.layout.Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun FormatSelector(
    selected: ExportFormat,
    onSelected: (ExportFormat) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Format", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            ExportFormat.values().forEach { format ->
                FrequencyRow(
                    label = format.name,
                    selected = format == selected,
                    onClick = { onSelected(format) }
                )
            }
        }
    }
}

@Composable
private fun ActionButtons(
    hasSchedule: Boolean,
    onSchedule: () -> Unit,
    onCancel: () -> Unit
) {
    androidx.compose.foundation.layout.Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Button(
            onClick = onSchedule,
            modifier = Modifier.weight(1f)
        ) {
            Text("Schedule export")
        }
        if (hasSchedule) {
            TextButton(
                onClick = onCancel,
                modifier = Modifier.weight(1f)
            ) {
                Text("Cancel")
            }
        }
    }
}


