import Foundation
import Combine
import SwiftUI

// Story Reader ViewModel - Enhanced with TTS, Dictionary, Bookmarks, Annotations
class StoryReaderViewModel: ObservableObject {
    @Published var chapter: Chapter?
    @Published var preferences: ReadingPreferences = ReadingPreferences()
    @Published var showControls: Bool = true
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    // TTS
    @Published var isTTSPlaying: Bool = false
    @Published var ttsProgress: Double = 0.0
    
    // Dictionary
    @Published var selectedWord: String?
    @Published var dictionaryEntry: DictionaryEntry?
    
    // Bookmarks & Annotations
    @Published var bookmarks: [Bookmark] = []
    @Published var annotations: [Annotation] = []
    
    private let chapterRepository = ChapterRepository()
    private let preferencesRepository = ReadingPreferencesRepository()
    private let bookmarkRepository = BookmarkRepository()
    private let annotationRepository = AnnotationRepository()
    let ttsManager = TextToSpeechManager.shared // Exposed for TTSPlayerView
    private var cancellables = Set<AnyCancellable>()
    private var autoHideTimer: Timer?
    
    init() {
        loadPreferences()
        observeTTS()
    }
    
    // Load reading preferences - CRITICAL for cross-device sync
    func loadPreferences() {
        preferencesRepository.getReadingPreferences()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to load preferences: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] prefs in
                    self?.preferences = prefs
                }
            )
            .store(in: &cancellables)
    }
    
    // Update reading preferences - CRITICAL: Syncs across all devices
    func updatePreferences(_ newPreferences: ReadingPreferences) {
        preferencesRepository.updateReadingPreferences(newPreferences)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to save preferences: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] updatedPrefs in
                    self?.preferences = updatedPrefs
                }
            )
            .store(in: &cancellables)
    }
    
    // Load chapter
    func loadChapter(storyId: String, chapterId: String) {
        isLoading = true
        errorMessage = nil
        
        chapterRepository.getChapter(storyId: storyId, chapterId: chapterId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] chapter in
                    self?.chapter = chapter
                    self?.loadBookmarksAndAnnotations(storyId: storyId, chapterId: chapterId)
                }
            )
            .store(in: &cancellables)
    }
    
    // Load bookmarks and annotations for chapter
    private func loadBookmarksAndAnnotations(storyId: String, chapterId: String) {
        let userId = AuthService.shared.getCurrentUserId()
        
        // Load bookmarks
        bookmarkRepository.getBookmarks(userId: userId, storyId: storyId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] bookmarks in
                    self?.bookmarks = bookmarks.filter { $0.chapterId == chapterId }
                }
            )
            .store(in: &cancellables)
        
        // Load annotations
        annotationRepository.getAnnotations(userId: userId, storyId: storyId, chapterId: chapterId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] annotations in
                    self?.annotations = annotations
                }
            )
            .store(in: &cancellables)
    }
    
    // TTS Controls
    func playTTS() {
        guard let content = chapter?.content else { return }
        Task {
            do {
                try await ttsManager.speak(text: content)
            } catch {
                errorMessage = "TTS failed: \(error.localizedDescription)"
            }
        }
    }
    
    func stopTTS() {
        ttsManager.stop()
    }
    
    func pauseTTS() {
        ttsManager.pause()
    }
    
    func resumeTTS() {
        ttsManager.resume()
    }
    
    private func observeTTS() {
        ttsManager.$isSpeaking
            .receive(on: DispatchQueue.main)
            .assign(to: &$isTTSPlaying)
        
        ttsManager.$currentProgress
            .receive(on: DispatchQueue.main)
            .assign(to: &$ttsProgress)
    }
    
    // Dictionary lookup
    func lookupWord(_ word: String) {
        selectedWord = word
        // Use TranslationRepository for dictionary lookup (it supports word lookup via GraphQL)
        let translationRepository = TranslationRepository()
        translationRepository.translateText(text: word, fromLang: "auto", toLang: "en", context: nil)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Dictionary lookup failed: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] translation in
                    // Create dictionary entry from translation
                    self?.dictionaryEntry = DictionaryEntry(
                        word: word,
                        definition: translation.translatedText,
                        pronunciation: nil,
                        pinyin: nil,
                        exampleSentences: []
                    )
                }
            )
            .store(in: &cancellables)
    }
    
    // Create bookmark
    func createBookmark(storyId: String, chapterId: String, position: Double, note: String?) {
        let userId = AuthService.shared.getCurrentUserId()
        let bookmark = Bookmark(
            id: UUID().uuidString,
            userId: userId,
            storyId: storyId,
            chapterId: chapterId,
            position: position,
            note: note,
            createdAt: Date(),
            syncedAt: nil,
            syncStatus: .pending
        )
        
        bookmarkRepository.createBookmark(bookmark)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to create bookmark: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] newBookmark in
                    self?.bookmarks.append(newBookmark)
                }
            )
            .store(in: &cancellables)
    }
    
    // Create annotation
    func createAnnotation(storyId: String, chapterId: String, paragraphIndex: Int, selectedText: String, note: String?, color: String?) {
        let userId = AuthService.shared.getCurrentUserId()
        let annotation = Annotation(
            id: UUID().uuidString,
            userId: userId,
            storyId: storyId,
            chapterId: chapterId,
            paragraphIndex: paragraphIndex,
            selectedText: selectedText,
            note: note,
            color: color,
            tags: nil,
            createdAt: Date(),
            updatedAt: nil,
            syncedAt: nil,
            syncStatus: .pending
        )
        
        annotationRepository.createAnnotation(annotation)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to create annotation: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] newAnnotation in
                    self?.annotations.append(newAnnotation)
                }
            )
            .store(in: &cancellables)
    }
    
    // Toggle controls (tap-to-toggle)
    func toggleControls() {
        guard preferences.tapToToggleControls else { return }
        showControls.toggle()
        scheduleAutoHide()
    }
    
    // Auto-hide controls
    private func scheduleAutoHide() {
        guard preferences.autoHideControls else { return }
        
        autoHideTimer?.invalidate()
        autoHideTimer = Timer.scheduledTimer(withTimeInterval: Double(preferences.controlsTimeout) / 1000.0, repeats: false) { [weak self] _ in
            self?.showControls = false
        }
    }
}
