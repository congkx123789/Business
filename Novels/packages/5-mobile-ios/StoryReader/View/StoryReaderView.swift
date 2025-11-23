import SwiftUI

// Story Reader View - Enhanced with TTS, Dictionary, Bookmarks, Annotations
struct StoryReaderView: View {
    @StateObject private var viewModel = StoryReaderViewModel()
    @StateObject private var commentsViewModel = ParagraphCommentsViewModel()
    @StateObject private var annotationTemplatesViewModel = AnnotationTemplatesViewModel()
    let storyId: String
    let chapterId: String
    let authorId: String?
    
    init(storyId: String, chapterId: String, authorId: String? = nil) {
        self.storyId = storyId
        self.chapterId = chapterId
        self.authorId = authorId
    }
    
    @State private var selectedParagraphIndex: Int?
    @State private var showCommentPanel = false
    @State private var showSettings = false
    @State private var showLayoutSettings = false
    @State private var showTTSPlayer = false
    @State private var dictionaryPosition: CGPoint?
    @State private var showDictionary = false
    @State private var showSidebar = false
    @State private var showAnnotationEditor = false
    @State private var showAnnotationSearch = false
    @State private var showAnnotationExport = false
    @State private var selectedAnnotationText: String = ""
    @State private var annotationNote: String = ""
    @State private var annotationColor: String = "#ffd700"
    @State private var multiColumnCount: Int = 2
    @State private var scrollPosition: Double = 0.0
    @State private var scrollReader: ScrollViewReader?
    
    var body: some View {
        ZStack {
            // Content
            if let chapter = viewModel.chapter {
                readerContent(for: chapter)
                    .background(viewModel.preferences.backgroundColorUI)
                    .opacity(viewModel.preferences.brightness)
                    .onTapGesture {
                        viewModel.toggleControls()
                    }
            } else if viewModel.isLoading {
                ProgressView("Loading...")
            } else {
                Text("Failed to load chapter")
                    .foregroundColor(.secondary)
            }
            
            // Controls overlay
            if viewModel.showControls {
                VStack {
                    // Top controls
                    HStack {
                        Button("Back") {
                            // Navigate back
                        }
                        Spacer()
                        Button("Settings") {
                            showSettings = true
                        }
                    }
                    .padding()
                    .background(Color.black.opacity(0.7))
                    
                    Spacer()
                    
                    // Bottom controls
                    VStack(spacing: 12) {
                        // TTS Player (if playing)
                        if viewModel.isTTSPlaying || showTTSPlayer {
                            TTSPlayerView(viewModel: viewModel)
                        }
                        
                        HStack {
                            // TTS button
                            Button(action: {
                                if viewModel.isTTSPlaying {
                                    viewModel.pauseTTS()
                                } else {
                                    viewModel.playTTS()
                                    showTTSPlayer = true
                                }
                            }) {
                                Image(systemName: viewModel.isTTSPlaying ? "pause.circle.fill" : "play.circle.fill")
                                    .font(.title2)
                            }
                            
                            Button("Aa") {
                                showSettings = true
                            }
                            
                            Button("Layout") {
                                showLayoutSettings = true
                            }
                            
                            Spacer()
                            
                            Button(readingModeSymbol(for: viewModel.preferences.readingMode)) {
                                // Toggle reading mode
                                var newPrefs = viewModel.preferences
                                switch newPrefs.readingMode {
                                case .scroll:
                                    newPrefs.readingMode = .pageTurn
                                case .pageTurn:
                                    newPrefs.readingMode = .multiColumn
                                case .multiColumn:
                                    newPrefs.readingMode = .scroll
                                }
                                viewModel.updatePreferences(newPrefs)
                            }
                            
                            Spacer()
                            
                            Button("☀️") {
                                // Toggle background mode
                                var newPrefs = viewModel.preferences
                                // Cycle through background modes
                                switch newPrefs.backgroundColor {
                                case "#ffffff": newPrefs.backgroundColor = "#0f172a"
                                case "#0f172a": newPrefs.backgroundColor = "#fbf0d9"
                                case "#fbf0d9": newPrefs.backgroundColor = "#e0f2e0"
                                default: newPrefs.backgroundColor = "#ffffff"
                                }
                                viewModel.updatePreferences(newPrefs)
                            }
                            
                            // Bookmark button
                            Button(action: {
                                viewModel.createBookmark(
                                    storyId: storyId,
                                    chapterId: chapterId,
                                    position: scrollPosition,
                                    note: nil
                                )
                            }) {
                                Image(systemName: "bookmark")
                                    .font(.title2)
                            }
                            
                            Button {
                                showSidebar.toggle()
                            } label: {
                                Image(systemName: "sidebar.right")
                                    .font(.title2)
                            }
                            
                            Button {
                                showAnnotationSearch = true
                            } label: {
                                Image(systemName: "magnifyingglass")
                                    .font(.title2)
                            }
                            
                            Button {
                                showAnnotationExport = true
                            } label: {
                                Image(systemName: "square.and.arrow.down")
                                    .font(.title2)
                            }
                        }
                        .padding()
                        .background(Color.black.opacity(0.7))
                    }
                }
            }
        }
        .overlay(alignment: .trailing) {
            if showSidebar {
                ReaderSidebarView(viewModel: viewModel)
                    .frame(maxWidth: 320)
                    .background(.ultraThinMaterial)
            }
        }
        .sheet(isPresented: $showCommentPanel) {
            if let paragraphIndex = selectedParagraphIndex {
                ParagraphCommentPanelView(
                    viewModel: commentsViewModel,
                    chapterId: chapterId,
                    paragraphIndex: paragraphIndex,
                    isPresented: $showCommentPanel
                )
            }
        }
        .sheet(isPresented: $showSettings) {
            ReadingPreferencesView(viewModel: viewModel)
        }
        .sheet(isPresented: $showLayoutSettings) {
            ReaderLayoutManager(viewModel: viewModel, columnCount: $multiColumnCount)
        }
        .sheet(isPresented: $showAnnotationEditor) {
            AdvancedAnnotationEditor(
                templatesViewModel: annotationTemplatesViewModel,
                selectedText: $selectedAnnotationText,
                note: $annotationNote,
                color: $annotationColor
            ) {
                viewModel.createAnnotation(
                    storyId: storyId,
                    chapterId: chapterId,
                    paragraphIndex: 0,
                    selectedText: selectedAnnotationText,
                    note: annotationNote.isEmpty ? nil : annotationNote,
                    color: annotationColor
                )
                showAnnotationEditor = false
            }
        }
        .sheet(isPresented: $showAnnotationSearch) {
            AnnotationSearchView(annotations: viewModel.annotations)
        }
        .sheet(isPresented: $showAnnotationExport) {
            AnnotationExportView(annotations: viewModel.annotations, userId: AuthService.shared.getCurrentUserId())
        }
        .overlay(alignment: .topLeading) {
            if showDictionary, let position = dictionaryPosition, let entry = viewModel.dictionaryEntry {
                DictionaryPopupView(entry: entry, position: position, isPresented: $showDictionary)
                    .offset(x: position.x, y: position.y)
            }
        }
        .task {
            viewModel.loadChapter(storyId: storyId, chapterId: chapterId)
            commentsViewModel.loadComments(chapterId: chapterId)
        }
    }
    
    @ViewBuilder
    private func readerContent(for chapter: Chapter) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(chapter.title)
                .font(.title)
                .padding(.horizontal)
            
            if let content = chapter.content {
                switch viewModel.preferences.readingMode {
                case .multiColumn:
                    MultiColumnReaderView(viewModel: viewModel, columns: multiColumnCount)
                        .padding(.horizontal)
                default:
                    ScrollViewReader { proxy in
                        ScrollView {
                            GeometryReader { geometry in
                                Color.clear
                                    .preference(key: ScrollOffsetPreferenceKey.self, value: geometry.frame(in: .named("scroll")).minY)
                            }
                            .frame(height: 0)
                            
                            VStack(alignment: .leading, spacing: 12) {
                                let paragraphs = content.components(separatedBy: "\n\n")
                                ForEach(Array(paragraphs.enumerated()), id: \.offset) { index, paragraph in
                                HStack(alignment: .top, spacing: 8) {
                                    Text(paragraph)
                                        .font(.system(size: CGFloat(viewModel.preferences.fontSize)))
                                        .lineSpacing(CGFloat(viewModel.preferences.lineHeight * Double(viewModel.preferences.fontSize)))
                                        .foregroundColor(viewModel.preferences.textColorUI)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .onLongPressGesture {
                                            selectedAnnotationText = paragraph
                                            annotationNote = ""
                                            annotationColor = viewModel.preferences.textColor
                                            showAnnotationEditor = true
                                        }
                                    
                                    VStack {
                                        ParagraphCommentBubbleView(
                                            commentCount: commentsViewModel.getCommentCount(for: index)
                                        ) {
                                            selectedParagraphIndex = index
                                            showCommentPanel = true
                                        }
                                        Spacer()
                                    }
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 8)
                            }
                            }
                        }
                        .coordinateSpace(name: "scroll")
                        .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
                            // Calculate scroll position (0.0 = top, 1.0 = bottom)
                            if let contentHeight = chapter.content?.count, contentHeight > 0 {
                                let maxScroll = max(0, Double(contentHeight) - 800) // Approximate visible height
                                scrollPosition = max(0, min(1, abs(value) / maxScroll))
                            }
                        }
                    }
                }
                
                VStack(spacing: 24) {
                    ChapterCommentsSectionView(storyId: storyId, chapterId: chapterId)
                    ReviewsSectionView(storyId: storyId)
                    ForumSectionView(storyId: storyId)
                    TippingView(storyId: storyId)
                    VotesView(storyId: storyId)
                    FanRankingsView(storyId: storyId)
                    if let authorId = authorId {
                        AuthorSupportView(authorId: authorId)
                    }
                    PollListView(storyId: storyId)
                    QuizListView(storyId: storyId)
                }
                .padding(.top, 16)
            } else {
                ProgressView("Loading chapter...")
                    .frame(maxWidth: .infinity, minHeight: 200)
            }
        }
        .padding(.vertical)
    }
    
    private func readingModeSymbol(for mode: ReadingPreferences.ReadingMode) -> String {
        switch mode {
        case .scroll:
            return "↑↓"
        case .pageTurn:
            return "←→"
        case .multiColumn:
            return "≡≡"
        }
    }
}

// Helper for scroll position tracking
struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
