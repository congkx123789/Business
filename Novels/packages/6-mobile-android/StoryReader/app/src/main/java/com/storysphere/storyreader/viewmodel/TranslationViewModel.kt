package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Translation
import com.storysphere.storyreader.model.DictionaryEntry
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TranslationViewModel @Inject constructor(
    // TODO: Inject TranslationRepository when created
) : ViewModel() {
    
    private val _translation = MutableStateFlow<Translation?>(null)
    val translation: StateFlow<Translation?> = _translation.asStateFlow()
    
    private val _dictionaryEntry = MutableStateFlow<DictionaryEntry?>(null)
    val dictionaryEntry: StateFlow<DictionaryEntry?> = _dictionaryEntry.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun translateText(
        text: String,
        sourceLanguage: String,
        targetLanguage: String,
        context: String? = null
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to translate text
                // _translation.value = translationRepository.translateText(text, sourceLanguage, targetLanguage, context)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun lookupWord(word: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to lookup word
                // _dictionaryEntry.value = translationRepository.lookupWord(word)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}
