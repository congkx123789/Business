package com.storysphere.storyreader.database

import androidx.room.Room
import androidx.room.testing.MigrationTestHelper
import androidx.sqlite.db.framework.FrameworkSQLiteOpenHelperFactory
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.storysphere.storyreader.database.migrations.MIGRATION_4_5
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.io.IOException

/**
 * Test database migration from version 4 to 5
 * 
 * Verifies:
 * - Migration executes without errors
 * - Tables are created correctly
 * - Indexes are created
 * - Data persistence works
 */
@RunWith(AndroidJUnit4::class)
class MigrationTest {
    private val TEST_DB = "migration-test"
    
    @get:Rule
    val helper: MigrationTestHelper = MigrationTestHelper(
        InstrumentationRegistry.getInstrumentation(),
        AppDatabase::class.java,
        emptyList(),
        FrameworkSQLiteOpenHelperFactory()
    )
    
    @Test
    @Throws(IOException::class)
    fun migrate4To5() {
        // Create version 4 database
        helper.createDatabase(TEST_DB, 4).apply {
            // Insert some test data in version 4
            execSQL("""
                INSERT INTO library (id, userId, storyId, addedAt, isFavorite, syncStatus)
                VALUES ('lib-1', 'user1', 'story-1', ${System.currentTimeMillis()}, 0, 'SYNCED')
            """.trimIndent())
            close()
        }
        
        // Run migration to version 5
        val db = Room.databaseBuilder(
            InstrumentationRegistry.getInstrumentation().targetContext,
            AppDatabase::class.java,
            TEST_DB
        )
            .addMigrations(MIGRATION_4_5)
            .build()
        
        // Verify migration succeeded
        db.openHelper.readableDatabase.use { database ->
            // Verify search_history table exists
            val searchHistoryCursor = database.rawQuery(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='search_history'",
                null
            )
            assert(searchHistoryCursor.count == 1) { "search_history table should exist" }
            searchHistoryCursor.close()
            
            // Verify filter_presets table exists
            val filterPresetsCursor = database.rawQuery(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='filter_presets'",
                null
            )
            assert(filterPresetsCursor.count == 1) { "filter_presets table should exist" }
            filterPresetsCursor.close()
            
            // Verify reading_stats table exists
            val readingStatsCursor = database.rawQuery(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='reading_stats'",
                null
            )
            assert(readingStatsCursor.count == 1) { "reading_stats table should exist" }
            readingStatsCursor.close()
            
            // Verify indexes exist
            val indexesCursor = database.rawQuery(
                "SELECT name FROM sqlite_master WHERE type='index'",
                null
            )
            val indexNames = mutableListOf<String>()
            while (indexesCursor.moveToNext()) {
                indexNames.add(indexesCursor.getString(0))
            }
            indexesCursor.close()
            
            // Check for expected indexes
            assert(indexNames.contains("index_search_history_userId_searchedAt")) {
                "index_search_history_userId_searchedAt should exist"
            }
            assert(indexNames.contains("index_search_history_userId_query_queryType")) {
                "index_search_history_userId_query_queryType should exist"
            }
            assert(indexNames.contains("index_filter_presets_userId")) {
                "index_filter_presets_userId should exist"
            }
            assert(indexNames.contains("index_filter_presets_userId_name")) {
                "index_filter_presets_userId_name should exist"
            }
            assert(indexNames.contains("index_reading_stats_userId")) {
                "index_reading_stats_userId should exist"
            }
            
            // Test data persistence - verify old data still exists
            val libraryCursor = database.rawQuery(
                "SELECT * FROM library WHERE id = 'lib-1'",
                null
            )
            assert(libraryCursor.count == 1) { "Old library data should persist after migration" }
            libraryCursor.close()
            
            // Test inserting data into new tables
            database.execSQL("""
                INSERT INTO search_history (id, userId, query, queryType, searchedAt)
                VALUES ('search-1', 'user1', 'test query', 'STORY', ${System.currentTimeMillis()})
            """.trimIndent())
            
            val searchCursor = database.rawQuery(
                "SELECT * FROM search_history WHERE id = 'search-1'",
                null
            )
            assert(searchCursor.count == 1) { "Should be able to insert into search_history" }
            searchCursor.close()
        }
        
        db.close()
    }
    
    @Test
    @Throws(IOException::class)
    fun testDataPersistence() {
        // Create version 4 database with data
        helper.createDatabase(TEST_DB, 4).apply {
            execSQL("""
                INSERT INTO reading_progress (id, userId, storyId, chapterId, position, progress, readingTime, lastReadAt, syncStatus)
                VALUES ('progress-1', 'user1', 'story-1', 'chapter-1', 0, 0.5, 60000, ${System.currentTimeMillis()}, 'SYNCED')
            """.trimIndent())
            close()
        }
        
        // Migrate to version 5
        val db = Room.databaseBuilder(
            InstrumentationRegistry.getInstrumentation().targetContext,
            AppDatabase::class.java,
            TEST_DB
        )
            .addMigrations(MIGRATION_4_5)
            .build()
        
        db.openHelper.readableDatabase.use { database ->
            // Verify old data persists
            val progressCursor = database.rawQuery(
                "SELECT * FROM reading_progress WHERE id = 'progress-1'",
                null
            )
            assert(progressCursor.count == 1) { "Reading progress data should persist after migration" }
            progressCursor.close()
        }
        
        db.close()
    }
}

