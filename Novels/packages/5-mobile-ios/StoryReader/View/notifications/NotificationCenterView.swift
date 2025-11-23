import SwiftUI

// Notification Center View - Lists in-app notifications
struct NotificationCenterView: View {
    @StateObject private var viewModel = NotificationsViewModel()
    let userId: String
    
    var body: some View {
        List {
            ForEach(viewModel.notifications, id: \.id) { notification in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(notification.title)
                            .font(.headline)
                        if !notification.isRead {
                            Circle()
                                .fill(Color.blue)
                                .frame(width: 8, height: 8)
                        }
                    }
                    Text(notification.body)
                        .font(.subheadline)
                    Text(notification.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 6)
                .onTapGesture {
                    viewModel.markAsRead(notificationId: notification.id, userId: userId)
                }
            }
        }
        .navigationTitle("Notifications")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Mark All") {
                    viewModel.markAllAsRead(userId: userId)
                }
                .disabled(viewModel.unreadCount == 0)
            }
        }
        .task {
            viewModel.loadNotifications(userId: userId)
        }
    }
}


