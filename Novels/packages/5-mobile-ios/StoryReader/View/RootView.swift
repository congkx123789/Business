import SwiftUI

// Root View - Main navigation
struct RootView: View {
    @StateObject private var appState = AppState()
    @StateObject private var authService = AuthService.shared
    
    private var userId: String {
        authService.getCurrentUserId()
    }
    
    var body: some View {
        TabView {
            StorefrontView()
                .tabItem {
                    Label("Discover", systemImage: "sparkles")
                }
            
            LibraryView()
                .tabItem {
                    Label("Library", systemImage: "books.vertical")
                }
            
            FeedView(userId: userId)
                .tabItem {
                    Label("Community", systemImage: "person.3")
                }
            
            GroupListView(userId: userId)
                .tabItem {
                    Label("Clubs", systemImage: "person.2")
                }
            
            RecommendationsView(userId: userId)
                .tabItem {
                    Label("For You", systemImage: "heart")
                }
            
            DownloadManagerView()
                .tabItem {
                    Label("Downloads", systemImage: "arrow.down.circle")
                }
        }
    }
}

