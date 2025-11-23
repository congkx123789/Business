package com.storysphere.storyreader.utils

/**
 * Sealed class for loading states
 */
sealed class LoadingState<out T> {
    object Idle : LoadingState<Nothing>()
    object Loading : LoadingState<Nothing>()
    data class Success<T>(val data: T) : LoadingState<T>()
    data class Error(val error: UIError) : LoadingState<Nothing>()
    
    val isLoading: Boolean
        get() = this is Loading
    
    val isSuccess: Boolean
        get() = this is Success
    
    val isError: Boolean
        get() = this is Error
    
    fun getDataOrNull(): T? {
        return (this as? Success)?.data
    }
    
    fun getErrorOrNull(): UIError? {
        return (this as? Error)?.error
    }
}

