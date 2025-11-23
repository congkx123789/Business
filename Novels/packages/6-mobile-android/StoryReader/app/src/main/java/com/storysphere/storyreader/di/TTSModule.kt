package com.storysphere.storyreader.di

import android.content.Context
import com.storysphere.storyreader.tts.NativeTTSEngine
import com.storysphere.storyreader.tts.TextToSpeechManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object TTSModule {
    @Provides
    @Singleton
    fun provideNativeTTSEngine(@ApplicationContext context: Context): NativeTTSEngine {
        return NativeTTSEngine(context)
    }
    
    @Provides
    @Singleton
    fun provideTextToSpeechManager(
        @ApplicationContext context: Context,
        nativeTTSEngine: NativeTTSEngine
    ): TextToSpeechManager {
        return TextToSpeechManager(context, nativeTTSEngine)
    }
}

