package com.storysphere.storyreader.model

data class Translation(
    val id: String,
    val userId: String,
    val sourceText: String,
    val translatedText: String,
    val sourceLanguage: String,
    val targetLanguage: String,
    val context: String? = null, // Story/chapter context
    val createdAt: Long = System.currentTimeMillis()
)

data class TranslationRequest(
    val text: String,
    val sourceLanguage: String,
    val targetLanguage: String,
    val context: String? = null
)

data class DictionaryEntry(
    val word: String,
    val pronunciation: String? = null,
    val pinyin: String? = null, // For Chinese
    val definitions: List<Definition> = emptyList(),
    val exampleSentences: List<String> = emptyList(),
    val relatedWords: List<String> = emptyList()
)

data class Definition(
    val partOfSpeech: String,
    val meaning: String,
    val examples: List<String> = emptyList()
)
