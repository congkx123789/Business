package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AnnotationTemplatesViewModel @Inject constructor(
    private val annotationRepository: com.storysphere.storyreader.repository.AnnotationRepository
) : ViewModel() {
    
    private val _templates = MutableStateFlow<List<AnnotationTemplate>>(emptyList())
    val templates: StateFlow<List<AnnotationTemplate>> = _templates.asStateFlow()
    
    private val _selectedTemplate = MutableStateFlow<AnnotationTemplate?>(null)
    val selectedTemplate: StateFlow<AnnotationTemplate?> = _selectedTemplate.asStateFlow()
    
    fun loadTemplates(userId: String) {
        viewModelScope.launch {
            try {
                // Load templates from repository or local storage
                // For now, use empty list - implement when repository supports templates
                _templates.value = emptyList()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun createTemplate(template: AnnotationTemplate) {
        viewModelScope.launch {
            try {
                // Create template - implement when repository supports templates
                val updated = _templates.value.toMutableList()
                updated.add(template)
                _templates.value = updated
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun updateTemplate(template: AnnotationTemplate) {
        viewModelScope.launch {
            try {
                // Update template
                val updated = _templates.value.toMutableList()
                val index = updated.indexOfFirst { it.id == template.id }
                if (index >= 0) {
                    updated[index] = template
                    _templates.value = updated
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun deleteTemplate(templateId: String) {
        viewModelScope.launch {
            try {
                // Delete template
                val updated = _templates.value.filter { it.id != templateId }
                _templates.value = updated
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun selectTemplate(template: AnnotationTemplate?) {
        _selectedTemplate.value = template
    }
}

data class AnnotationTemplate(
    val id: String,
    val name: String,
    val color: String? = null,
    val tags: List<String> = emptyList(),
    val noteTemplate: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)


