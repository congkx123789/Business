package com.storysphere.storyreader.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.viewmodel.SettingsViewModel

@Composable
fun LayoutSettingsScreen(
    viewModel: SettingsViewModel = hiltViewModel(),
    userId: String,
    onBack: () -> Unit = {}
) {
    val preferences by viewModel.readingPreferences.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Layout Settings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(text = "Font Size")
            Slider(
                value = (preferences?.fontSize ?: 16).toFloat(),
                onValueChange = { viewModel.updateFontSize(userId, it.toInt()) },
                valueRange = 12f..28f
            )
            Text(text = "Line Height")
            Slider(
                value = preferences?.lineHeight ?: 1.4f,
                onValueChange = { viewModel.updateLineHeight(userId, it) },
                valueRange = 1.0f..2.0f
            )
            Text(text = "Reading Mode")
            ReadingModeToggle(
                current = preferences?.readingMode ?: ReadingMode.SCROLL,
                onChange = { viewModel.updateReadingMode(userId, it) }
            )
        }
    }
}

@Composable
private fun ReadingModeToggle(
    current: ReadingMode,
    onChange: (ReadingMode) -> Unit
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        ReadingMode.values().forEach { mode ->
            FilterChip(
                selected = mode == current,
                onClick = { onChange(mode) },
                label = { Text(mode.name.lowercase().replaceFirstChar { it.uppercaseChar() }) }
            )
        }
    }
}

