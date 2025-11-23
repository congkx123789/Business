package com.storysphere.storyreader.tts

import android.content.Context
import android.util.Log
import javax.inject.Inject
import javax.inject.Singleton

enum class TTSEngineType {
    NATIVE,
    EMBEDDED // Proprietary SDK (60MB, high quality)
}

@Singleton
class TextToSpeechManager @Inject constructor(
    private val context: Context,
    private val nativeTTSEngine: NativeTTSEngine
) {
    private var currentEngine: TTSEngine? = null
    private var engineType: TTSEngineType = TTSEngineType.NATIVE
    
    init {
        // Default to native TTS
        currentEngine = nativeTTSEngine
    }
    
    fun setEngine(type: TTSEngineType) {
        engineType = type
        currentEngine = when (type) {
            TTSEngineType.NATIVE -> nativeTTSEngine
            TTSEngineType.EMBEDDED -> {
                // TODO: Initialize embedded TTS engine when available
                Log.w("TextToSpeechManager", "Embedded TTS engine not yet implemented")
                nativeTTSEngine
            }
        }
    }
    
    suspend fun speak(text: String, onUtteranceCompleted: (() -> Unit)? = null) {
        currentEngine?.speak(text, onUtteranceCompleted)
    }
    
    suspend fun stop() {
        currentEngine?.stop()
    }
    
    suspend fun pause() {
        currentEngine?.pause()
    }
    
    suspend fun resume() {
        currentEngine?.resume()
    }
    
    fun setSpeechRate(rate: Float) {
        currentEngine?.setSpeechRate(rate)
    }
    
    fun setPitch(pitch: Float) {
        currentEngine?.setPitch(pitch)
    }
    
    fun isSpeaking(): Boolean {
        return currentEngine?.isSpeaking() ?: false
    }
    
    fun shutdown() {
        currentEngine?.shutdown()
        currentEngine = null
    }
}

