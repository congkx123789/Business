import Foundation

// Translation model - Language learning support
struct Translation: Codable, Identifiable {
    let id: String
    let text: String
    let translatedText: String
    let fromLang: String
    let toLang: String
    let context: TranslationContext?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case text
        case translatedText = "translated_text"
        case fromLang = "from_lang"
        case toLang = "to_lang"
        case context
        case createdAt = "created_at"
    }
}

// TranslationContext model
struct TranslationContext: Codable {
    let storyId: String?
    let chapterId: String?
    let paragraphIndex: Int?
    let surroundingText: String?
    
    enum CodingKeys: String, CodingKey {
        case storyId = "story_id"
        case chapterId = "chapter_id"
        case paragraphIndex = "paragraph_index"
        case surroundingText = "surrounding_text"
    }
}

// ChapterTranslation model
struct ChapterTranslation: Codable {
    let chapterId: String
    let fromLang: String
    let toLang: String
    let translations: [SentenceTranslation]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case chapterId = "chapter_id"
        case fromLang = "from_lang"
        case toLang = "to_lang"
        case translations
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// SentenceTranslation model
struct SentenceTranslation: Codable {
    let sentence: String
    let translatedSentence: String
    let sentenceIndex: Int
    let context: String?
    
    enum CodingKeys: String, CodingKey {
        case sentence
        case translatedSentence = "translated_sentence"
        case sentenceIndex = "sentence_index"
        case context
    }
}

// ParallelTranslation model
struct ParallelTranslation: Codable, Identifiable {
    let id: String
    let text: String
    let translatedText: String
    let fromLang: String
    let toLang: String
    let displayMode: ParallelDisplayMode
    let segments: [ParallelSegment]
    let createdAt: Date
    
    enum ParallelDisplayMode: String, Codable {
        case lineByLine = "line-by-line"
        case sideBySide = "side-by-side"
        case interleaved
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case text
        case translatedText = "translated_text"
        case fromLang = "from_lang"
        case toLang = "to_lang"
        case displayMode = "display_mode"
        case segments
        case createdAt = "created_at"
    }
}

// ParallelSegment model
struct ParallelSegment: Codable {
    let original: String
    let translated: String
    let segmentIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case original
        case translated
        case segmentIndex = "segment_index"
    }
}

