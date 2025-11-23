package com.storysphere.storyreader.di

import com.apollographql.apollo3.ApolloClient
import com.storysphere.storyreader.auth.AuthManager
import com.storysphere.storyreader.network.AuthInterceptor
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.network.WebSocketService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    private const val BASE_URL = "http://localhost:3000" // TODO: Move to BuildConfig
    
    @Provides
    @Singleton
    fun provideAuthInterceptor(authManager: AuthManager): AuthInterceptor {
        return AuthInterceptor(authManager)
    }
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApolloClient(
        okHttpClient: OkHttpClient,
        authInterceptor: AuthInterceptor
    ): ApolloClient {
        return ApolloClient.Builder()
            .serverUrl("$BASE_URL/graphql")
            .okHttpClient(okHttpClient)
            .httpInterceptors(listOf(authInterceptor))
            .build()
    }
    
    @Provides
    @Singleton
    fun provideGraphQLService(apolloClient: ApolloClient): GraphQLService {
        return GraphQLService(apolloClient)
    }
    
    @Provides
    @Singleton
    fun provideWebSocketService(): WebSocketService {
        return WebSocketService()
    }
}

