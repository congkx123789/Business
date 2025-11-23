package com.storysphere.storyreader.di

import android.content.Context
import androidx.room.Room
import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.migrations.MIGRATION_4_5
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "storyreader_database"
        )
            .addMigrations(MIGRATION_4_5)
            .fallbackToDestructiveMigration() // TODO: Remove in production, implement all migrations
            .build()
    }
}

