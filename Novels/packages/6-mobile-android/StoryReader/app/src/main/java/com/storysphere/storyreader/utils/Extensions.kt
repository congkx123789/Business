package com.storysphere.storyreader.utils

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onStart

/**
 * Extension function to handle loading and error states in Flow
 */
fun <T> Flow<T>.handleLoadingAndError(
    onLoading: () -> Unit = {},
    onError: (Throwable) -> Unit = {}
): Flow<T> {
    return this
        .onStart { onLoading() }
        .catch { error -> onError(error) }
}

/**
 * Extension function to convert Result to Flow
 */
fun <T> Result<T>.toFlow(): Flow<T> {
    return kotlinx.coroutines.flow.flow {
        this@toFlow.fold(
            onSuccess = { emit(it) },
            onFailure = { throw it }
        )
    }
}

