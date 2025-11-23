package com.storysphere.storyreader.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.storysphere.storyreader.database.converter.StringListConverter
import com.storysphere.storyreader.database.dao.*
import com.storysphere.storyreader.database.entity.*

@Database(
    entities = [
        StoryEntity::class,
        ChapterMetadataEntity::class,
        LibraryEntity::class,
        ReadingProgressEntity::class,
        ReadingPreferencesEntity::class,
        BookmarkEntity::class,
        AnnotationEntity::class,
        BookshelfEntity::class,
        TagEntity::class,
        NotificationEntity::class,
        PostEntity::class,
        WishlistEntity::class,
        WalletEntity::class,
        TransactionEntity::class,
        ExportRecordEntity::class,
        SearchHistoryEntity::class,
        FilterPresetEntity::class,
        ReadingStatsEntity::class
    ],
    version = 5, // Incremented version due to schema change (added SearchHistory, FilterPreset, ReadingStats)
    exportSchema = false
)
@TypeConverters(StringListConverter::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun storyDao(): StoryDao
    abstract fun chapterDao(): ChapterDao
    abstract fun libraryDao(): LibraryDao
    abstract fun readingProgressDao(): ReadingProgressDao
    abstract fun readingPreferencesDao(): ReadingPreferencesDao
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun annotationDao(): AnnotationDao
    abstract fun bookshelfDao(): BookshelfDao
    abstract fun tagDao(): TagDao
    abstract fun notificationDao(): NotificationDao
    abstract fun postDao(): PostDao
    abstract fun wishlistDao(): WishlistDao
    abstract fun walletDao(): WalletDao
    abstract fun transactionDao(): TransactionDao
    abstract fun exportRecordDao(): ExportRecordDao
    abstract fun searchHistoryDao(): SearchHistoryDao
    abstract fun filterPresetDao(): FilterPresetDao
    abstract fun readingStatsDao(): ReadingStatsDao
}

