package com.storysphere.storyreader.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.tts.TTSEngineType
import com.storysphere.storyreader.viewmodel.SettingsViewModel

@Composable
fun TTSSettingsScreen(
    viewModel: SettingsViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val ttsEngineType by viewModel.ttsEngineType.collectAsState()
    val ttsSpeed by viewModel.ttsSpeed.collectAsState()
    val ttsPitch by viewModel.ttsPitch.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("TTS Settings") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Text("←")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // TTS Engine Selection
            PreferenceSection(title = "TTS Engine") {
                TTSEnginePreference(
                    currentEngine = ttsEngineType,
                    onEngineChange = { viewModel.setTTSEngine(it) }
                )
            }
            
            // TTS Speed
            PreferenceSection(title = "Speech Settings") {
                TTSSpeedPreference(
                    currentSpeed = ttsSpeed,
                    onSpeedChange = { viewModel.setTTSSpeed(it) }
                )
                
                TTSPitchPreference(
                    currentPitch = ttsPitch,
                    onPitchChange = { viewModel.setTTSPitch(it) }
                )
            }
            
            // Test TTS
            PreferenceSection(title = "Test") {
                Button(
                    onClick = { viewModel.testTTS() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Test TTS")
                }
            }
        }
    }
}

@Composable
fun TTSEnginePreference(
    currentEngine: TTSEngineType,
    onEngineChange: (TTSEngineType) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        TTSEngineOption(
            engine = TTSEngineType.NATIVE,
            isSelected = currentEngine == TTSEngineType.NATIVE,
            description = "Android native TTS (free, basic quality)",
            onClick = { onEngineChange(TTSEngineType.NATIVE) }
        )
        
        TTSEngineOption(
            engine = TTSEngineType.EMBEDDED,
            isSelected = currentEngine == TTSEngineType.EMBEDDED,
            description = "Embedded TTS SDK (60MB, high quality)",
            onClick = { onEngineChange(TTSEngineType.EMBEDDED) },
            enabled = false // TODO: Enable when embedded engine is implemented
        )
    }
}

@Composable
fun TTSEngineOption(
    engine: TTSEngineType,
    isSelected: Boolean,
    description: String,
    onClick: () -> Unit,
    enabled: Boolean = true
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = enabled, onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) 
                MaterialTheme.colorScheme.primaryContainer 
            else 
                MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = engine.name,
                    style = MaterialTheme.typography.titleSmall
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            RadioButton(
                selected = isSelected,
                onClick = onClick,
                enabled = enabled
            )
        }
    }
}

@Composable
fun TTSSpeedPreference(
    currentSpeed: Float,
    onSpeedChange: (Float) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Speech Speed")
            Text(String.format("%.1fx", currentSpeed), style = MaterialTheme.typography.bodyMedium)
        }
        Slider(
            value = currentSpeed,
            onValueChange = onSpeedChange,
            valueRange = 0.5f..2.0f,
            steps = 14
        )
    }
}

@Composable
fun TTSPitchPreference(
    currentPitch: Float,
    onPitchChange: (Float) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Pitch")
            Text(String.format("%.1f", currentPitch), style = MaterialTheme.typography.bodyMedium)
        }
        Slider(
            value = currentPitch,
            onValueChange = onPitchChange,
            valueRange = 0.5f..2.0f,
            steps = 14
        )
    }
}

