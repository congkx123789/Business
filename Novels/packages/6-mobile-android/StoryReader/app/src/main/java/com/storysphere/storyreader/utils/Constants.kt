package com.storysphere.storyreader.utils

object Constants {
    // API Configuration
    const val BASE_URL = "http://localhost:3000"
    const val GRAPHQL_ENDPOINT = "$BASE_URL/graphql"
    const val WEBSOCKET_ENDPOINT = "$BASE_URL/ws"
    
    // Default Values
    const val DEFAULT_FONT_SIZE = 16
    const val DEFAULT_LINE_HEIGHT = 1.5f
    const val DEFAULT_BRIGHTNESS = 50
    const val DEFAULT_CONTROLS_TIMEOUT = 3000L
    
    // Reading Preferences
    const val MIN_FONT_SIZE = 12
    const val MAX_FONT_SIZE = 24
    const val MIN_LINE_HEIGHT = 1.0f
    const val MAX_LINE_HEIGHT = 2.5f
    const val MIN_BRIGHTNESS = 0
    const val MAX_BRIGHTNESS = 100
    
    // TTS
    const val MIN_TTS_SPEED = 0.5f
    const val MAX_TTS_SPEED = 2.0f
    const val DEFAULT_TTS_SPEED = 1.0f
    const val MIN_TTS_PITCH = 0.5f
    const val MAX_TTS_PITCH = 2.0f
    const val DEFAULT_TTS_PITCH = 1.0f
    
    // Storage
    const val MAX_STORAGE_AGE_DAYS = 30
    const val MAX_STORAGE_SIZE_MB = 1024L // 1GB
    
    // Sync
    const val SYNC_RETRY_DELAY_MS = 5000L
    const val MAX_SYNC_RETRIES = 3
}

