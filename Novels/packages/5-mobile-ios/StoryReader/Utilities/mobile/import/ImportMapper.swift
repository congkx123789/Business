import Foundation

/// Maps imported payloads into domain models
struct ImportMapper {
    func mapLibraryItems(from data: Data) throws -> [LibraryItem] {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([LibraryItem].self, from: data)
    }
    
    func mapAnnotations(from data: Data) throws -> [Annotation] {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([Annotation].self, from: data)
    }
}


