package com.storysphere.storyreader.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.BackgroundMode
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.viewmodel.SettingsViewModel

@Composable
fun ReadingPreferencesScreen(
    userId: String = "user1", // TODO: Get from auth
    viewModel: SettingsViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val preferences by viewModel.readingPreferences.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadPreferences(userId)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reading Preferences") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Text("←")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                preferences?.let { prefs ->
                    // Font Size
                    PreferenceSection(title = "Text Settings") {
                        FontSizePreference(
                            currentSize = prefs.fontSize,
                            onSizeChange = { viewModel.updateFontSize(userId, it) }
                        )
                        
                        LineHeightPreference(
                            currentHeight = prefs.lineHeight,
                            onHeightChange = { viewModel.updateLineHeight(userId, it) }
                        )
                    }
                    
                    // Reading Mode
                    PreferenceSection(title = "Reading Mode") {
                        ReadingModePreference(
                            currentMode = prefs.readingMode,
                            onModeChange = { viewModel.updateReadingMode(userId, it) }
                        )
                    }
                    
                    // Background
                    PreferenceSection(title = "Background") {
                        BackgroundModePreference(
                            currentMode = prefs.backgroundColor,
                            customColor = prefs.customBackgroundColor,
                            onModeChange = { viewModel.updateBackgroundColor(userId, it) },
                            onCustomColorChange = { viewModel.updateCustomBackgroundColor(userId, it) }
                        )
                    }
                    
                    // Brightness
                    PreferenceSection(title = "Display") {
                        BrightnessPreference(
                            currentBrightness = prefs.brightness,
                            onBrightnessChange = { viewModel.updateBrightness(userId, it) }
                        )
                    }
                    
                    // Controls
                    PreferenceSection(title = "Controls") {
                        SwitchPreference(
                            title = "Tap to Toggle Controls",
                            checked = prefs.tapToToggleControls,
                            onCheckedChange = { viewModel.updateTapToToggleControls(userId, it) }
                        )
                        
                        SwitchPreference(
                            title = "Auto-hide Controls",
                            checked = prefs.autoHideControls,
                            onCheckedChange = { viewModel.updateAutoHideControls(userId, it) }
                        )
                        
                        if (prefs.autoHideControls) {
                            ControlsTimeoutPreference(
                                currentTimeout = prefs.controlsTimeout,
                                onTimeoutChange = { viewModel.updateControlsTimeout(userId, it) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PreferenceSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium
            )
            content()
        }
    }
}

@Composable
fun FontSizePreference(
    currentSize: Int,
    onSizeChange: (Int) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Font Size")
            Text("${currentSize}sp", style = MaterialTheme.typography.bodyMedium)
        }
        Slider(
            value = currentSize.toFloat(),
            onValueChange = { onSizeChange(it.toInt()) },
            valueRange = 12f..24f,
            steps = 11
        )
    }
}

@Composable
fun LineHeightPreference(
    currentHeight: Float,
    onHeightChange: (Float) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Line Height")
            Text(String.format("%.1f", currentHeight), style = MaterialTheme.typography.bodyMedium)
        }
        Slider(
            value = currentHeight,
            onValueChange = onHeightChange,
            valueRange = 1.0f..2.5f,
            steps = 14
        )
    }
}

@Composable
fun ReadingModePreference(
    currentMode: ReadingMode,
    onModeChange: (ReadingMode) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        ReadingModeButton(
            mode = ReadingMode.SCROLL,
            isSelected = currentMode == ReadingMode.SCROLL,
            onClick = { onModeChange(ReadingMode.SCROLL) }
        )
        ReadingModeButton(
            mode = ReadingMode.PAGE_TURN,
            isSelected = currentMode == ReadingMode.PAGE_TURN,
            onClick = { onModeChange(ReadingMode.PAGE_TURN) }
        )
    }
}

@Composable
fun ReadingModeButton(
    mode: ReadingMode,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isSelected) 
                MaterialTheme.colorScheme.primary 
            else 
                MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Text(mode.name.replace("_", " "))
    }
}

@Composable
fun BackgroundModePreference(
    currentMode: BackgroundMode,
    customColor: String?,
    onModeChange: (BackgroundMode) -> Unit,
    onCustomColorChange: (String) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            BackgroundModeChip(BackgroundMode.WHITE, currentMode, onModeChange)
            BackgroundModeChip(BackgroundMode.BLACK, currentMode, onModeChange)
            BackgroundModeChip(BackgroundMode.SEPIA, currentMode, onModeChange)
            BackgroundModeChip(BackgroundMode.EYE_PROTECTION, currentMode, onModeChange)
        }
        
        if (currentMode == BackgroundMode.CUSTOM) {
            // TODO: Add color picker
            Text("Custom color picker (TODO)")
        }
    }
}

@Composable
fun BackgroundModeChip(
    mode: BackgroundMode,
    selectedMode: BackgroundMode,
    onClick: (BackgroundMode) -> Unit
) {
    FilterChip(
        selected = mode == selectedMode,
        onClick = { onClick(mode) },
        label = { Text(mode.name) },
        modifier = Modifier.weight(1f)
    )
}

@Composable
fun BrightnessPreference(
    currentBrightness: Int,
    onBrightnessChange: (Int) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Brightness")
            Text("$currentBrightness%", style = MaterialTheme.typography.bodyMedium)
        }
        Slider(
            value = currentBrightness.toFloat(),
            onValueChange = { onBrightnessChange(it.toInt()) },
            valueRange = 0f..100f
        )
    }
}

@Composable
fun SwitchPreference(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
fun ControlsTimeoutPreference(
    currentTimeout: Long,
    onTimeoutChange: (Long) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Controls Timeout")
            Text("${currentTimeout / 1000}s", style = MaterialTheme.typography.bodyMedium)
        }
        Slider(
            value = currentTimeout.toFloat(),
            onValueChange = { onTimeoutChange(it.toLong()) },
            valueRange = 1000f..10000f,
            steps = 8
        )
    }
}

