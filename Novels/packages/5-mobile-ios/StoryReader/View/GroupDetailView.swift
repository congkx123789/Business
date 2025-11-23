import SwiftUI
import UIKit

// Group Detail View - Displays members, schedule, and discussion for a group
struct GroupDetailView: View, Identifiable {
    let id = UUID()
    let group: Group
    let userId: String
    
    @StateObject private var viewModel = GroupViewModel()
    @State private var showJoinConfirmation = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    groupHeader
                    groupStats
                    groupActions
                    groupDescription
                    MemberListView(members: viewModel.groupMembers)
                }
                .padding()
            }
            .navigationTitle(group.name)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showJoinConfirmation = true
                    } label: {
                        Label("Join", systemImage: "person.badge.plus")
                    }
                }
            }
            .task {
                viewModel.loadGroupMembers(groupId: group.id)
            }
            .confirmationDialog("Join \(group.name)?", isPresented: $showJoinConfirmation) {
                Button("Join Group") {
                    viewModel.joinGroup(userId: userId, groupId: group.id)
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("You'll receive updates and schedules in your community feed.")
            }
        }
    }
    
    private var groupHeader: some View {
        HStack(alignment: .top, spacing: 16) {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.accentColor.opacity(0.15))
                .frame(width: 80, height: 80)
                .overlay {
                    Image(systemName: group.type == .bookClub ? "book" : "person.3")
                        .font(.system(size: 36))
                        .foregroundColor(.accentColor)
                }
            
            VStack(alignment: .leading, spacing: 8) {
                Text(group.name)
                    .font(.title2)
                    .fontWeight(.semibold)
                Label(group.isPublic ? "Public group" : "Private group", systemImage: group.isPublic ? "globe" : "lock.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private var groupStats: some View {
        HStack(spacing: 16) {
            StatPill(label: "Members", value: "\(group.memberCount)", icon: "person.2")
            StatPill(label: group.isPublic ? "Public" : "Private", value: group.isPublic ? "Open" : "Invite", icon: group.isPublic ? "globe" : "lock.fill")
        }
    }
    
    private var groupActions: some View {
        HStack(spacing: 12) {
            Button {
                showJoinConfirmation = true
            } label: {
                Label("Join Discussion", systemImage: "message")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            
            Button {
                shareGroup()
            } label: {
                Image(systemName: "square.and.arrow.up")
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.bordered)
        }
    }
    
    private var groupDescription: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("About")
                .font(.headline)
            Text(group.description ?? "No description provided yet.")
                .foregroundColor(.secondary)
        }
    }
    
    private func shareGroup() {
        let shareText = "Check out \(group.name) on StoryReader!"
        let shareURL = URL(string: "https://storyreader.app/group/\(group.id)") ?? URL(string: "https://storyreader.app")!
        let activityVC = UIActivityViewController(activityItems: [shareText, shareURL], applicationActivities: nil)
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(activityVC, animated: true)
        }
    }
}

// MARK: - Subviews

private struct StatPill: View {
    let label: String
    let value: String
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
            VStack(alignment: .leading) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.headline)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct MemberListView: View {
    let members: [User]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Members")
                .font(.headline)
            if members.isEmpty {
                Text("Members will appear after you join.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            } else {
                ForEach(members) { member in
                    HStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 36, height: 36)
                            .overlay(Text(String(member.username.prefix(1))).font(.headline))
                        VStack(alignment: .leading) {
                            Text(member.username)
                                .fontWeight(.medium)
                            Text(member.profile?.displayName ?? member.email)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }
}


