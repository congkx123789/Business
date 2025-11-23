package com.storysphere.storyreader.database.migrations

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * Migration from version 4 to 5
 * 
 * Adds:
 * - search_history table
 * - filter_presets table
 * - reading_stats table
 */
val MIGRATION_4_5 = object : Migration(4, 5) {
    override fun migrate(database: SupportSQLiteDatabase) {
        // Create search_history table
        database.execSQL("""
            CREATE TABLE IF NOT EXISTS search_history (
                id TEXT NOT NULL PRIMARY KEY,
                userId TEXT NOT NULL,
                query TEXT NOT NULL,
                queryType TEXT NOT NULL,
                searchedAt INTEGER NOT NULL
            )
        """.trimIndent())
        
        // Create index on search_history
        database.execSQL("""
            CREATE INDEX IF NOT EXISTS index_search_history_userId_searchedAt 
            ON search_history(userId, searchedAt)
        """.trimIndent())
        
        database.execSQL("""
            CREATE UNIQUE INDEX IF NOT EXISTS index_search_history_userId_query_queryType 
            ON search_history(userId, query, queryType)
        """.trimIndent())
        
        // Create filter_presets table
        database.execSQL("""
            CREATE TABLE IF NOT EXISTS filter_presets (
                id TEXT NOT NULL PRIMARY KEY,
                userId TEXT NOT NULL,
                name TEXT NOT NULL,
                filterQueryJson TEXT NOT NULL,
                createdAt INTEGER NOT NULL,
                lastUsedAt INTEGER NOT NULL
            )
        """.trimIndent())
        
        // Create index on filter_presets
        database.execSQL("""
            CREATE INDEX IF NOT EXISTS index_filter_presets_userId 
            ON filter_presets(userId)
        """.trimIndent())
        
        database.execSQL("""
            CREATE UNIQUE INDEX IF NOT EXISTS index_filter_presets_userId_name 
            ON filter_presets(userId, name)
        """.trimIndent())
        
        // Create reading_stats table
        database.execSQL("""
            CREATE TABLE IF NOT EXISTS reading_stats (
                id TEXT NOT NULL PRIMARY KEY,
                userId TEXT NOT NULL,
                totalReadingTimeMinutes REAL NOT NULL,
                totalWordsRead INTEGER NOT NULL,
                averageWPM REAL NOT NULL,
                completedStories INTEGER NOT NULL,
                inProgressStories INTEGER NOT NULL,
                totalStories INTEGER NOT NULL,
                lastUpdated INTEGER NOT NULL
            )
        """.trimIndent())
        
        // Create unique index on reading_stats
        database.execSQL("""
            CREATE UNIQUE INDEX IF NOT EXISTS index_reading_stats_userId 
            ON reading_stats(userId)
        """.trimIndent())
    }
}

