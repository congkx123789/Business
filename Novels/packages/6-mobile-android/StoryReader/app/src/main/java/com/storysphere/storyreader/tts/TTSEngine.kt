package com.storysphere.storyreader.tts

interface TTSEngine {
    suspend fun speak(text: String, onUtteranceCompleted: (() -> Unit)? = null)
    suspend fun stop()
    suspend fun pause()
    suspend fun resume()
    fun setSpeechRate(rate: Float) // 0.5x to 2.0x
    fun setPitch(pitch: Float) // 0.5 to 2.0
    fun isSpeaking(): Boolean
    fun shutdown()
}

