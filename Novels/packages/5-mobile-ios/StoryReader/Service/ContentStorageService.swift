import Foundation
import Combine

// Content Storage Service - Downloads and stores chapter content files
class ContentStorageService {
    static let shared = ContentStorageService()
    
    private let fileManager = FileStorageManager.shared
    private let encryptionService = ContentEncryptionService.shared
    private let session = URLSession.shared
    
    // Download chapter content and store encrypted
    func downloadChapter(storyId: String, chapterId: String, url: URL) -> AnyPublisher<Double, Error> {
        return Future { promise in
            let task = self.session.downloadTask(with: url) { localURL, response, error in
                if let error = error {
                    promise(.failure(error))
                    return
                }
                
                guard let localURL = localURL,
                      let data = try? Data(contentsOf: localURL) else {
                    promise(.failure(DownloadError.invalidData))
                    return
                }
                
                do {
                    // Encrypt content
                    let encryptedData = try self.encryptionService.encrypt(data)
                    
                    // Save to file
                    try self.fileManager.saveChapterContent(storyId: storyId, chapterId: chapterId, data: encryptedData)
                    
                    promise(.success(1.0))
                } catch {
                    promise(.failure(error))
                }
            }
            
            // Track progress
            var observation: NSKeyValueObservation?
            observation = task.progress.observe(\.fractionCompleted) { progress, _ in
                promise(.success(progress.fractionCompleted))
            }
            
            task.resume()
        }
        .eraseToAnyPublisher()
    }
    
    // Load chapter content (decrypts on-the-fly)
    func loadChapterContent(storyId: String, chapterId: String) throws -> String {
        // Check if file exists
        guard fileManager.chapterExists(storyId: storyId, chapterId: chapterId) else {
            throw ContentError.fileNotFound
        }
        
        // Load encrypted data
        let encryptedData = try fileManager.loadChapterContent(storyId: storyId, chapterId: chapterId)
        
        // Decrypt
        let decryptedData = try encryptionService.decrypt(encryptedData)
        
        // Convert to string
        guard let content = String(data: decryptedData, encoding: .utf8) else {
            throw ContentError.invalidEncoding
        }
        
        return content
    }
    
    // Check if chapter is downloaded
    func isChapterDownloaded(storyId: String, chapterId: String) -> Bool {
        return fileManager.chapterExists(storyId: storyId, chapterId: chapterId)
    }
    
    // Delete downloaded chapter
    func deleteChapter(storyId: String, chapterId: String) throws {
        try fileManager.deleteChapter(storyId: storyId, chapterId: chapterId)
    }
    
    enum DownloadError: Error {
        case invalidData
        case downloadFailed
    }
    
    enum ContentError: Error {
        case fileNotFound
        case invalidEncoding
        case decryptionFailed
    }
}

