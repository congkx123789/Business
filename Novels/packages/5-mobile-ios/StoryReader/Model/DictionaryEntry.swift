import Foundation

// Dictionary Entry model - Word definition and examples
struct DictionaryEntry: Codable, Equatable {
    let word: String
    let pronunciation: String?
    let pinyin: String? // For Chinese
    let definitions: [Definition]
    let examples: [String]?
    
    struct Definition: Codable, Equatable {
        let partOfSpeech: String
        let meaning: String
        let synonyms: [String]?
    }
}

