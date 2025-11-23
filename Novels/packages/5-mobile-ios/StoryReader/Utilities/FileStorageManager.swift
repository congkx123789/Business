import Foundation

// File Storage Manager - Manages App-Specific Storage for chapter content files
class FileStorageManager {
    static let shared = FileStorageManager()
    
    private let fileManager = FileManager.default
    private var documentsDirectory: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    private var chaptersDirectory: URL {
        documentsDirectory.appendingPathComponent("Chapters", isDirectory: true)
    }
    
    init() {
        createDirectoriesIfNeeded()
    }
    
    private func createDirectoriesIfNeeded() {
        try? fileManager.createDirectory(at: chaptersDirectory, withIntermediateDirectories: true)
    }
    
    // Get file path for chapter content
    func getChapterPath(storyId: String, chapterId: String) -> URL {
        let storyDir = chaptersDirectory.appendingPathComponent(storyId, isDirectory: true)
        return storyDir.appendingPathComponent("\(chapterId).encrypted")
    }
    
    // Check if chapter file exists
    func chapterExists(storyId: String, chapterId: String) -> Bool {
        let path = getChapterPath(storyId: storyId, chapterId: chapterId)
        return fileManager.fileExists(atPath: path.path)
    }
    
    // Save chapter content to file
    func saveChapterContent(storyId: String, chapterId: String, data: Data) throws {
        let storyDir = chaptersDirectory.appendingPathComponent(storyId, isDirectory: true)
        try fileManager.createDirectory(at: storyDir, withIntermediateDirectories: true)
        
        let filePath = getChapterPath(storyId: storyId, chapterId: chapterId)
        try data.write(to: filePath, options: .atomic)
    }
    
    // Load chapter content from file
    func loadChapterContent(storyId: String, chapterId: String) throws -> Data {
        let filePath = getChapterPath(storyId: storyId, chapterId: chapterId)
        return try Data(contentsOf: filePath)
    }
    
    // Delete chapter file
    func deleteChapter(storyId: String, chapterId: String) throws {
        let filePath = getChapterPath(storyId: storyId, chapterId: chapterId)
        try fileManager.removeItem(at: filePath)
    }
    
    // Get storage size
    func getStorageSize() -> Int64 {
        guard let enumerator = fileManager.enumerator(at: chaptersDirectory, includingPropertiesForKeys: [.fileSizeKey]) else {
            return 0
        }
        
        var totalSize: Int64 = 0
        for case let fileURL as URL in enumerator {
            if let fileSize = try? fileURL.resourceValues(forKeys: [.fileSizeKey]).fileSize {
                totalSize += Int64(fileSize)
            }
        }
        return totalSize
    }
    
    // Cleanup old files (keep last N chapters per story)
    func cleanupOldFiles(keepLast: Int = 10) throws {
        let storyDirs = try fileManager.contentsOfDirectory(at: chaptersDirectory, includingPropertiesForKeys: [.contentModificationDateKey])
        
        for storyDir in storyDirs {
            let chapterFiles = try fileManager.contentsOfDirectory(at: storyDir, includingPropertiesForKeys: [.contentModificationDateKey])
            
            let sortedFiles = chapterFiles.sorted { file1, file2 in
                let date1 = (try? file1.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? Date.distantPast
                let date2 = (try? file2.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? Date.distantPast
                return date1 > date2
            }
            
            // Delete files beyond keepLast
            for file in sortedFiles.dropFirst(keepLast) {
                try fileManager.removeItem(at: file)
            }
        }
    }
}

