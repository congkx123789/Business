package com.storysphere.storyreader.di

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.repository.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideSearchRepository(
        database: AppDatabase,
        graphQLService: GraphQLService
    ): SearchRepository {
        return SearchRepository(database, graphQLService)
    }

    // Note: Other repositories are already provided via @Inject constructor
    // This module is for repositories that need special setup or SearchRepository
}

