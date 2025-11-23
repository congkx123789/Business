package com.storysphere.storyreader.tts

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import kotlinx.coroutines.suspendCancellableCoroutine
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume

@Singleton
class NativeTTSEngine @Inject constructor(
    private val context: Context
) : TTSEngine {
    private var tts: TextToSpeech? = null
    private var isInitialized = false
    private var onUtteranceCompletedCallback: (() -> Unit)? = null
    
    init {
        initializeTTS()
    }
    
    private fun initializeTTS() {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val result = tts?.setLanguage(Locale.getDefault())
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    // Language not supported, use default
                    tts?.setLanguage(Locale.US)
                }
                isInitialized = true
                
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        // TTS started
                    }
                    
                    override fun onDone(utteranceId: String?) {
                        onUtteranceCompletedCallback?.invoke()
                        onUtteranceCompletedCallback = null
                    }
                    
                    override fun onError(utteranceId: String?) {
                        onUtteranceCompletedCallback?.invoke()
                        onUtteranceCompletedCallback = null
                    }
                })
            }
        }
    }
    
    override suspend fun speak(text: String, onUtteranceCompleted: (() -> Unit)?) {
        if (!isInitialized) {
            return
        }
        
        onUtteranceCompletedCallback = onUtteranceCompleted
        
        tts?.speak(
            text,
            TextToSpeech.QUEUE_ADD,
            null,
            "utterance_${System.currentTimeMillis()}"
        )
    }
    
    override suspend fun stop() {
        tts?.stop()
        onUtteranceCompletedCallback = null
    }
    
    override suspend fun pause() {
        // Android TTS doesn't support pause directly
        // We can stop and resume from saved position
        tts?.stop()
    }
    
    override suspend fun resume() {
        // Resume from saved position
        // Implementation depends on saved state
    }
    
    override fun setSpeechRate(rate: Float) {
        tts?.setSpeechRate(rate.coerceIn(0.5f, 2.0f))
    }
    
    override fun setPitch(pitch: Float) {
        tts?.setPitch(pitch.coerceIn(0.5f, 2.0f))
    }
    
    override fun isSpeaking(): Boolean {
        return tts?.isSpeaking == true
    }
    
    override fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isInitialized = false
    }
}

