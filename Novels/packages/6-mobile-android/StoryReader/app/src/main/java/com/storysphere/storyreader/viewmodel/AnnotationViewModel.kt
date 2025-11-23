package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Annotation
import com.storysphere.storyreader.repository.AnnotationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class AnnotationViewModel @Inject constructor(
    private val annotationRepository: AnnotationRepository
) : ViewModel() {
    private val _annotations = MutableStateFlow<List<Annotation>>(emptyList())
    val annotations: StateFlow<List<Annotation>> = _annotations.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadAnnotations(userId: String, chapterId: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                annotationRepository.getAnnotations(userId, chapterId).collect { annotations ->
                    _annotations.value = annotations
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                _error.value = e.message
                _isLoading.value = false
            }
        }
    }
    
    fun createAnnotation(
        userId: String,
        storyId: String,
        chapterId: String,
        startPosition: Int,
        endPosition: Int,
        selectedText: String,
        note: String? = null,
        color: String? = null,
        tags: List<String> = emptyList()
    ) {
        viewModelScope.launch {
            val annotation = Annotation(
                id = UUID.randomUUID().toString(),
                userId = userId,
                storyId = storyId,
                chapterId = chapterId,
                startPosition = startPosition,
                endPosition = endPosition,
                selectedText = selectedText,
                note = note,
                color = color,
                tags = tags,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            annotationRepository.createAnnotation(annotation).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
    
    fun updateAnnotation(annotation: Annotation) {
        viewModelScope.launch {
            val updated = annotation.copy(updatedAt = System.currentTimeMillis())
            annotationRepository.updateAnnotation(updated).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
    
    fun deleteAnnotation(annotationId: String, userId: String) {
        viewModelScope.launch {
            annotationRepository.deleteAnnotation(annotationId, userId).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
}

