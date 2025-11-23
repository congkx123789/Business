package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.BackgroundMode
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.model.ReadingPreferences
import com.storysphere.storyreader.repository.ReadingPreferencesRepository
import com.storysphere.storyreader.tts.TextToSpeechManager
import com.storysphere.storyreader.tts.TTSEngineType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val readingPreferencesRepository: ReadingPreferencesRepository,
    private val ttsManager: TextToSpeechManager
) : ViewModel() {
    private val _readingPreferences = MutableStateFlow<ReadingPreferences?>(null)
    val readingPreferences: StateFlow<ReadingPreferences?> = _readingPreferences.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _ttsEngineType = MutableStateFlow(TTSEngineType.NATIVE)
    val ttsEngineType: StateFlow<TTSEngineType> = _ttsEngineType.asStateFlow()
    
    private val _ttsSpeed = MutableStateFlow(1.0f)
    val ttsSpeed: StateFlow<Float> = _ttsSpeed.asStateFlow()
    
    private val _ttsPitch = MutableStateFlow(1.0f)
    val ttsPitch: StateFlow<Float> = _ttsPitch.asStateFlow()
    
    fun loadPreferences(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            readingPreferencesRepository.getPreferences(userId).collect { preferences ->
                _readingPreferences.value = preferences
                _isLoading.value = false
            }
        }
    }
    
    fun updateFontSize(userId: String, fontSize: Int) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(fontSize = fontSize)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateLineHeight(userId: String, lineHeight: Float) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(lineHeight = lineHeight)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateReadingMode(userId: String, mode: ReadingMode) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(readingMode = mode)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateBackgroundColor(userId: String, mode: BackgroundMode) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(backgroundColor = mode)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateCustomBackgroundColor(userId: String, color: String) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(customBackgroundColor = color)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateBrightness(userId: String, brightness: Int) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(brightness = brightness)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateTapToToggleControls(userId: String, enabled: Boolean) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(tapToToggleControls = enabled)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateAutoHideControls(userId: String, enabled: Boolean) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(autoHideControls = enabled)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    fun updateControlsTimeout(userId: String, timeout: Long) {
        viewModelScope.launch {
            val current = _readingPreferences.value
            if (current != null) {
                val updated = current.copy(controlsTimeout = timeout)
                readingPreferencesRepository.updatePreferences(updated)
            }
        }
    }
    
    // TTS Settings
    fun setTTSEngine(engineType: TTSEngineType) {
        _ttsEngineType.value = engineType
        ttsManager.setEngine(engineType)
    }
    
    fun setTTSSpeed(speed: Float) {
        _ttsSpeed.value = speed
        ttsManager.setSpeechRate(speed)
    }
    
    fun setTTSPitch(pitch: Float) {
        _ttsPitch.value = pitch
        ttsManager.setPitch(pitch)
    }
    
    fun testTTS() {
        viewModelScope.launch {
            ttsManager.speak("This is a test of the text to speech system.")
        }
    }
}

