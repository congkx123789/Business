package com.storysphere.storyreader.network

import com.apollographql.apollo3.api.http.HttpHeader
import com.apollographql.apollo3.api.http.HttpRequest
import com.apollographql.apollo3.api.http.HttpResponse
import com.apollographql.apollo3.network.http.HttpInterceptor
import com.apollographql.apollo3.network.http.HttpInterceptorChain
import com.storysphere.storyreader.auth.AuthManager
import javax.inject.Inject

/**
 * Apollo HTTP Interceptor to add authentication token to requests
 */
class AuthInterceptor @Inject constructor(
    private val authManager: AuthManager
) : HttpInterceptor {
    override suspend fun intercept(
        request: HttpRequest,
        chain: HttpInterceptorChain
    ): HttpResponse {
        val token = authManager.getToken()
        
        val modifiedRequest = if (token != null) {
            request.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            request
        }
        
        return chain.proceed(modifiedRequest)
    }
}

