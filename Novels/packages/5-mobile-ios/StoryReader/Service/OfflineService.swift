import CoreData
import Foundation

// OfflineService - Core Data for metadata storage (NO BLOBs)
class OfflineService {
    private let context: NSManagedObjectContext
    
    init(context: NSManagedObjectContext = CoreDataStack.shared.viewContext) {
        self.context = context
    }
    
    // MARK: - Library Operations
    
    func saveLibraryItem(_ item: LibraryItem) throws {
        let request: NSFetchRequest<LibraryEntity> = LibraryEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", item.id)
        
        let entity = try context.fetch(request).first ?? LibraryEntity(context: context)
        entity.id = item.id
        entity.storyId = item.storyId
        entity.userId = item.userId
        entity.addedAt = item.addedAt
        entity.lastReadAt = item.lastReadAt
        entity.readingProgress = item.readingProgress ?? 0.0
        entity.isCompleted = item.isCompleted
        entity.tags = item.tags
        entity.bookshelfIds = item.bookshelfIds
        entity.syncedAt = item.syncedAt
        entity.syncStatus = item.syncStatus.rawValue
        
        try context.save()
    }
    
    func getLibraryItems(userId: String) throws -> [LibraryItem] {
        let request: NSFetchRequest<LibraryEntity> = LibraryEntity.fetchRequest()
        request.predicate = NSPredicate(format: "userId == %@", userId)
        
        let entities = try context.fetch(request)
        return entities.map { entity in
            LibraryItem(
                id: entity.id ?? "",
                storyId: entity.storyId ?? "",
                userId: entity.userId ?? "",
                addedAt: entity.addedAt ?? Date(),
                lastReadAt: entity.lastReadAt,
                readingProgress: entity.readingProgress > 0 ? Double(entity.readingProgress) : nil,
                isCompleted: entity.isCompleted,
                tags: entity.tags,
                bookshelfIds: entity.bookshelfIds,
                syncedAt: entity.syncedAt,
                syncStatus: LibraryItem.SyncStatus(rawValue: entity.syncStatus ?? "synced") ?? .synced
            )
        }
    }
    
    func deleteLibraryItem(itemId: String) throws {
        let request: NSFetchRequest<LibraryEntity> = LibraryEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", itemId)
        
        if let entity = try context.fetch(request).first {
            context.delete(entity)
            try context.save()
        }
    }
    
    // MARK: - Reading Progress Operations
    
    func saveReadingProgress(_ progress: ReadingProgress) throws {
        let request: NSFetchRequest<ReadingProgressEntity> = ReadingProgressEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", progress.id)
        
        let entity = try context.fetch(request).first ?? ReadingProgressEntity(context: context)
        entity.id = progress.id
        entity.userId = progress.userId
        entity.storyId = progress.storyId
        entity.chapterId = progress.chapterId
        entity.position = progress.position
        entity.completedAt = progress.completedAt
        entity.syncedAt = progress.syncedAt
        entity.syncStatus = progress.syncStatus.rawValue
        
        try context.save()
    }
    
    func getReadingProgress(userId: String, storyId: String?, chapterId: String?) throws -> ReadingProgress? {
        let request: NSFetchRequest<ReadingProgressEntity> = ReadingProgressEntity.fetchRequest()
        var predicates: [NSPredicate] = [NSPredicate(format: "userId == %@", userId)]
        
        if let storyId = storyId {
            predicates.append(NSPredicate(format: "storyId == %@", storyId))
        }
        if let chapterId = chapterId {
            predicates.append(NSPredicate(format: "chapterId == %@", chapterId))
        }
        
        request.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        request.sortDescriptors = [NSSortDescriptor(key: "completedAt", ascending: false)]
        
        guard let entity = try context.fetch(request).first else { return nil }
        
        return ReadingProgress(
            id: entity.id,
            userId: entity.userId ?? "",
            storyId: entity.storyId ?? "",
            chapterId: entity.chapterId ?? "",
            position: Double(entity.position),
            completedAt: entity.completedAt,
            syncedAt: entity.syncedAt,
            syncStatus: ReadingProgress.SyncStatus(rawValue: entity.syncStatus ?? "synced") ?? .synced
        )
    }
    
    // MARK: - Reading Preferences Operations
    
    func saveReadingPreferences(_ preferences: ReadingPreferences) throws {
        let request: NSFetchRequest<ReadingPreferencesEntity> = ReadingPreferencesEntity.fetchRequest()
        let entity = try context.fetch(request).first ?? ReadingPreferencesEntity(context: context)
        
        entity.fontSize = Int16(preferences.fontSize)
        entity.lineHeight = preferences.lineHeight
        entity.backgroundColor = preferences.backgroundColor
        entity.textColor = preferences.textColor
        entity.fontFamily = preferences.fontFamily
        entity.readingMode = preferences.readingMode.rawValue
        entity.brightness = preferences.brightness
        entity.tapToToggleControls = preferences.tapToToggleControls
        entity.autoHideControls = preferences.autoHideControls
        entity.controlsTimeout = Int32(preferences.controlsTimeout)
        entity.syncedAt = preferences.syncedAt
        
        try context.save()
    }
    
    func getReadingPreferences() throws -> ReadingPreferences? {
        let request: NSFetchRequest<ReadingPreferencesEntity> = ReadingPreferencesEntity.fetchRequest()
        guard let entity = try context.fetch(request).first else { return nil }
        
        return ReadingPreferences(
            fontSize: Int(entity.fontSize),
            lineHeight: entity.lineHeight,
            backgroundColor: entity.backgroundColor ?? "#0f172a",
            textColor: entity.textColor ?? "#e2e8f0",
            fontFamily: entity.fontFamily ?? "system",
            readingMode: ReadingPreferences.ReadingMode(rawValue: entity.readingMode ?? "scroll") ?? .scroll,
            brightness: entity.brightness,
            tapToToggleControls: entity.tapToToggleControls,
            autoHideControls: entity.autoHideControls,
            controlsTimeout: Int(entity.controlsTimeout),
            syncedAt: entity.syncedAt
        )
    }
    
    // MARK: - Bookmark Operations
    
    func saveBookmark(_ bookmark: Bookmark) throws {
        let request: NSFetchRequest<BookmarkEntity> = BookmarkEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", bookmark.id)
        
        let entity = try context.fetch(request).first ?? BookmarkEntity(context: context)
        entity.id = bookmark.id
        entity.userId = bookmark.userId
        entity.storyId = bookmark.storyId
        entity.chapterId = bookmark.chapterId
        entity.position = bookmark.position
        entity.note = bookmark.note
        entity.createdAt = bookmark.createdAt
        entity.syncedAt = bookmark.syncedAt
        entity.syncStatus = bookmark.syncStatus.rawValue
        
        try context.save()
    }
    
    func getBookmarks(userId: String, storyId: String?, chapterId: String?) throws -> [Bookmark] {
        let request: NSFetchRequest<BookmarkEntity> = BookmarkEntity.fetchRequest()
        var predicates: [NSPredicate] = [NSPredicate(format: "userId == %@", userId)]
        
        if let storyId = storyId {
            predicates.append(NSPredicate(format: "storyId == %@", storyId))
        }
        if let chapterId = chapterId {
            predicates.append(NSPredicate(format: "chapterId == %@", chapterId))
        }
        
        request.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        request.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        
        let entities = try context.fetch(request)
        return entities.map { entity in
            Bookmark(
                id: entity.id ?? "",
                userId: entity.userId ?? "",
                storyId: entity.storyId ?? "",
                chapterId: entity.chapterId ?? "",
                position: Double(entity.position),
                note: entity.note,
                createdAt: entity.createdAt ?? Date(),
                syncedAt: entity.syncedAt,
                syncStatus: Bookmark.SyncStatus(rawValue: entity.syncStatus ?? "synced") ?? .synced
            )
        }
    }
    
    func deleteBookmark(bookmarkId: String) throws {
        let request: NSFetchRequest<BookmarkEntity> = BookmarkEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", bookmarkId)
        
        if let entity = try context.fetch(request).first {
            context.delete(entity)
            try context.save()
        }
    }
    
    // MARK: - Annotation Operations
    
    func saveAnnotation(_ annotation: Annotation) throws {
        let request: NSFetchRequest<AnnotationEntity> = AnnotationEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", annotation.id)
        
        let entity = try context.fetch(request).first ?? AnnotationEntity(context: context)
        entity.id = annotation.id
        entity.userId = annotation.userId
        entity.storyId = annotation.storyId
        entity.chapterId = annotation.chapterId
        entity.paragraphIndex = Int32(annotation.paragraphIndex)
        entity.selectedText = annotation.selectedText
        entity.note = annotation.note
        entity.color = annotation.color
        entity.tags = annotation.tags
        entity.createdAt = annotation.createdAt
        entity.updatedAt = annotation.updatedAt
        entity.syncedAt = annotation.syncedAt
        entity.syncStatus = annotation.syncStatus.rawValue
        
        try context.save()
    }
    
    func getAnnotations(userId: String, storyId: String?, chapterId: String?) throws -> [Annotation] {
        let request: NSFetchRequest<AnnotationEntity> = AnnotationEntity.fetchRequest()
        var predicates: [NSPredicate] = [NSPredicate(format: "userId == %@", userId)]
        
        if let storyId = storyId {
            predicates.append(NSPredicate(format: "storyId == %@", storyId))
        }
        if let chapterId = chapterId {
            predicates.append(NSPredicate(format: "chapterId == %@", chapterId))
        }
        
        request.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        request.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        
        let entities = try context.fetch(request)
        return entities.map { entity in
            Annotation(
                id: entity.id ?? "",
                userId: entity.userId ?? "",
                storyId: entity.storyId ?? "",
                chapterId: entity.chapterId ?? "",
                paragraphIndex: Int(entity.paragraphIndex),
                selectedText: entity.selectedText ?? "",
                note: entity.note,
                color: entity.color,
                tags: entity.tags,
                createdAt: entity.createdAt ?? Date(),
                updatedAt: entity.updatedAt,
                syncedAt: entity.syncedAt,
                syncStatus: Annotation.SyncStatus(rawValue: entity.syncStatus ?? "synced") ?? .synced
            )
        }
    }
    
    func deleteAnnotation(annotationId: String) throws {
        let request: NSFetchRequest<AnnotationEntity> = AnnotationEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", annotationId)
        
        if let entity = try context.fetch(request).first {
            context.delete(entity)
            try context.save()
        }
    }
    
    // MARK: - Chapter Metadata Operations
    
    func saveChapterMetadata(_ chapter: Chapter) throws {
        let request: NSFetchRequest<ChapterMetadataEntity> = ChapterMetadataEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", chapter.id)
        
        let entity = try context.fetch(request).first ?? ChapterMetadataEntity(context: context)
        entity.id = chapter.id
        entity.storyId = chapter.storyId
        entity.title = chapter.title
        entity.index = Int32(chapter.index)
        entity.isLocked = chapter.isLocked
        entity.price = Int32(chapter.price ?? 0)
        // Note: content is NOT stored here - it's in encrypted files via ContentStorageService
        
        try context.save()
    }
    
    func getChapterMetadata(chapterId: String) throws -> Chapter? {
        let request: NSFetchRequest<ChapterMetadataEntity> = ChapterMetadataEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", chapterId)
        
        guard let entity = try context.fetch(request).first else { return nil }
        
        return Chapter(
            id: entity.id ?? "",
            storyId: entity.storyId ?? "",
            title: entity.title ?? "",
            content: "", // Content is loaded from encrypted file, not Core Data
            contentPath: nil,
            index: Int(entity.index),
            isLocked: entity.isLocked,
            price: entity.price > 0 ? Int(entity.price) : nil
        )
    }
}

// MARK: - Core Data Entity Definitions
// These entities need to be created in Xcode .xcdatamodeld file
// These are placeholder class definitions for compile-time reference

@objc(LibraryEntity)
class LibraryEntity: NSManagedObject {
    @NSManaged var id: String?
    @NSManaged var storyId: String?
    @NSManaged var userId: String?
    @NSManaged var addedAt: Date?
    @NSManaged var lastReadAt: Date?
    @NSManaged var readingProgress: Double
    @NSManaged var isCompleted: Bool
    @NSManaged var tags: [String]?
    @NSManaged var bookshelfIds: [String]?
    @NSManaged var syncedAt: Date?
    @NSManaged var syncStatus: String?
}

@objc(ReadingProgressEntity)
class ReadingProgressEntity: NSManagedObject {
    @NSManaged var id: String?
    @NSManaged var userId: String?
    @NSManaged var storyId: String?
    @NSManaged var chapterId: String?
    @NSManaged var position: Double
    @NSManaged var completedAt: Date?
    @NSManaged var syncedAt: Date?
    @NSManaged var syncStatus: String?
}

@objc(ReadingPreferencesEntity)
class ReadingPreferencesEntity: NSManagedObject {
    @NSManaged var fontSize: Int16
    @NSManaged var lineHeight: Double
    @NSManaged var backgroundColor: String?
    @NSManaged var textColor: String?
    @NSManaged var fontFamily: String?
    @NSManaged var readingMode: String?
    @NSManaged var brightness: Double
    @NSManaged var tapToToggleControls: Bool
    @NSManaged var autoHideControls: Bool
    @NSManaged var controlsTimeout: Int32
    @NSManaged var syncedAt: Date?
}

@objc(BookmarkEntity)
class BookmarkEntity: NSManagedObject {
    @NSManaged var id: String?
    @NSManaged var userId: String?
    @NSManaged var storyId: String?
    @NSManaged var chapterId: String?
    @NSManaged var position: Double
    @NSManaged var note: String?
    @NSManaged var createdAt: Date?
    @NSManaged var syncedAt: Date?
    @NSManaged var syncStatus: String?
}

@objc(AnnotationEntity)
class AnnotationEntity: NSManagedObject {
    @NSManaged var id: String?
    @NSManaged var userId: String?
    @NSManaged var storyId: String?
    @NSManaged var chapterId: String?
    @NSManaged var paragraphIndex: Int32
    @NSManaged var selectedText: String?
    @NSManaged var note: String?
    @NSManaged var color: String?
    @NSManaged var tags: [String]?
    @NSManaged var createdAt: Date?
    @NSManaged var updatedAt: Date?
    @NSManaged var syncedAt: Date?
    @NSManaged var syncStatus: String?
}

@objc(ChapterMetadataEntity)
class ChapterMetadataEntity: NSManagedObject {
    @NSManaged var id: String?
    @NSManaged var storyId: String?
    @NSManaged var title: String?
    @NSManaged var index: Int32
    @NSManaged var isLocked: Bool
    @NSManaged var price: Int32
}
