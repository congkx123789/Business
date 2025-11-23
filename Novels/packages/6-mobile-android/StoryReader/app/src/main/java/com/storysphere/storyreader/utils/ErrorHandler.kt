package com.storysphere.storyreader.utils

import android.util.Log
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onStart

/**
 * Sealed class for UI error states
 */
sealed class UIError {
    data class NetworkError(val message: String) : UIError()
    data class DatabaseError(val message: String) : UIError()
    data class UnknownError(val message: String) : UIError()
    
    val displayMessage: String
        get() = when (this) {
            is NetworkError -> "Network error: $message"
            is DatabaseError -> "Database error: $message"
            is UnknownError -> "Error: $message"
        }
}

/**
 * Extension function to handle errors in Flow and convert to UIError
 */
fun <T> Flow<T>.handleErrors(
    onError: (UIError) -> Unit = {}
): Flow<T> {
    return this.catch { throwable ->
        val error = when {
            throwable.message?.contains("network", ignoreCase = true) == true ||
            throwable.message?.contains("connection", ignoreCase = true) == true -> {
                UIError.NetworkError(throwable.message ?: "Network error occurred")
            }
            throwable.message?.contains("database", ignoreCase = true) == true ||
            throwable.message?.contains("room", ignoreCase = true) == true -> {
                UIError.DatabaseError(throwable.message ?: "Database error occurred")
            }
            else -> {
                UIError.UnknownError(throwable.message ?: "An unknown error occurred")
            }
        }
        
        Log.e("ErrorHandler", error.displayMessage, throwable)
        onError(error)
    }
}

/**
 * Extension function for Result to convert to UIError
 */
fun <T> Result<T>.toUIError(): UIError? {
    return this.exceptionOrNull()?.let { throwable ->
        when {
            throwable.message?.contains("network", ignoreCase = true) == true ||
            throwable.message?.contains("connection", ignoreCase = true) == true -> {
                UIError.NetworkError(throwable.message ?: "Network error occurred")
            }
            throwable.message?.contains("database", ignoreCase = true) == true ||
            throwable.message?.contains("room", ignoreCase = true) == true -> {
                UIError.DatabaseError(throwable.message ?: "Database error occurred")
            }
            else -> {
                UIError.UnknownError(throwable.message ?: "An unknown error occurred")
            }
        }
    }
}

