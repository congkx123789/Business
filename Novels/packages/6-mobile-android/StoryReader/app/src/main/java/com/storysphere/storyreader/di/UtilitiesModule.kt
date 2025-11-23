package com.storysphere.storyreader.di

import android.content.Context
import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.repository.AnnotationRepository
import com.storysphere.storyreader.repository.ExportImportRepository
import com.storysphere.storyreader.repository.SearchRepository
import com.storysphere.storyreader.utils.mobile.bulk.BulkOperationManager
import com.storysphere.storyreader.utils.mobile.bulk.SelectionStateManager
import com.storysphere.storyreader.utils.mobile.haptics.HapticManager
import com.storysphere.storyreader.utils.mobile.import.ImportManager
import com.storysphere.storyreader.utils.mobile.import.ImportMapper
import com.storysphere.storyreader.utils.mobile.import.ImportValidator
import com.storysphere.storyreader.utils.mobile.search.FilterEngine
import com.storysphere.storyreader.utils.mobile.search.FilterPresetsManager
import com.storysphere.storyreader.utils.mobile.search.QueryBuilder
import com.storysphere.storyreader.utils.mobile.search.SavedFiltersManager
import com.storysphere.storyreader.utils.mobile.search.SearchHistoryManager
import com.storysphere.storyreader.utils.mobile.search.SearchIndexManager
import com.storysphere.storyreader.utils.mobile.search.SearchSuggestionsManager
import com.storysphere.storyreader.utils.mobile.stats.ReadingStatsCalculator
import com.storysphere.storyreader.utils.mobile.stats.StatsAggregator
import com.storysphere.storyreader.utils.mobile.stats.StatsStorage
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object UtilitiesModule {

    // Import Utilities
    @Provides
    @Singleton
    fun provideImportValidator(): ImportValidator {
        return ImportValidator()
    }

    @Provides
    @Singleton
    fun provideImportMapper(): ImportMapper {
        return ImportMapper()
    }

    @Provides
    @Singleton
    fun provideImportManager(
        @ApplicationContext context: Context,
        importValidator: ImportValidator,
        importMapper: ImportMapper,
        exportImportRepository: ExportImportRepository
    ): ImportManager {
        return ImportManager(context, importValidator, importMapper, exportImportRepository)
    }

    // Search Utilities
    @Provides
    @Singleton
    fun provideSearchHistoryManager(database: AppDatabase): SearchHistoryManager {
        return SearchHistoryManager(database)
    }

    @Provides
    @Singleton
    fun provideSearchSuggestionsManager(
        searchHistoryManager: SearchHistoryManager
    ): SearchSuggestionsManager {
        return SearchSuggestionsManager(searchHistoryManager)
    }

    @Provides
    @Singleton
    fun provideFilterPresetsManager(database: AppDatabase): FilterPresetsManager {
        return FilterPresetsManager(database)
    }

    @Provides
    @Singleton
    fun provideSearchIndexManager(@ApplicationContext context: Context): SearchIndexManager {
        return SearchIndexManager(context)
    }

    @Provides
    @Singleton
    fun provideQueryBuilder(): QueryBuilder {
        return QueryBuilder()
    }

    @Provides
    @Singleton
    fun provideFilterEngine(): FilterEngine {
        return FilterEngine()
    }

    @Provides
    @Singleton
    fun provideSavedFiltersManager(
        filterPresetsManager: FilterPresetsManager
    ): SavedFiltersManager {
        return SavedFiltersManager(filterPresetsManager)
    }

    // Stats Utilities
    @Provides
    @Singleton
    fun provideReadingStatsCalculator(): ReadingStatsCalculator {
        return ReadingStatsCalculator()
    }

    @Provides
    @Singleton
    fun provideStatsStorage(database: AppDatabase): StatsStorage {
        return StatsStorage(database)
    }

    @Provides
    @Singleton
    fun provideStatsAggregator(
        calculator: ReadingStatsCalculator,
        storage: StatsStorage
    ): StatsAggregator {
        return StatsAggregator(calculator, storage)
    }

    // Bulk Utilities
    @Provides
    @Singleton
    fun provideSelectionStateManager(): SelectionStateManager {
        return SelectionStateManager()
    }

    @Provides
    @Singleton
    fun provideBulkOperationManager(): BulkOperationManager {
        return BulkOperationManager()
    }

    // Haptics
    @Provides
    @Singleton
    fun provideHapticManager(@ApplicationContext context: Context): HapticManager {
        return HapticManager(context)
    }
}

