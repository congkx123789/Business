import Foundation
import Combine
// NOTE: Socket.IO client integration pending - placeholder structure ready
// When Socket.IO Swift client is available, uncomment and implement:
// import SocketIO

// WebSocket Service - Real-time communication for sync and live updates
class WebSocketService: ObservableObject {
    static let shared = WebSocketService()
    
    @Published var isConnected: Bool = false
    @Published var lastEvent: WebSocketEvent?
    
    // Socket.IO client (will be initialized when SDK is available)
    // private var socket: SocketIOClient?
    private var subscriptions: [String: AnyCancellable] = [:]
    private let baseURL: URL
    
    init(baseURL: URL = URL(string: "http://localhost:3000")!) {
        self.baseURL = baseURL
    }
    
    func connect(userId: String) {
        // Socket.IO connection implementation (pending SDK)
        // When Socket.IO Swift client is available:
        // let manager = SocketManager(socketURL: baseURL, config: [.log(true), .compress])
        // socket = manager.defaultSocket
        // socket?.connect()
        // socket?.on(clientEvent: .connect) { [weak self] _, _ in
        //     self?.isConnected = true
        // }
        
        // For now, mark as connected (will be properly implemented with Socket.IO)
        isConnected = true
        
        // Subscribe to sync events
        subscribe("sync:\(userId)") { [weak self] event in
            self?.handleSyncEvent(event)
        }
        
        // Subscribe to paragraph comments
        subscribe("paragraph-comments") { [weak self] event in
            self?.handleParagraphCommentEvent(event)
        }
        
        // Subscribe to wallet updates
        subscribe("wallet:\(userId)") { [weak self] event in
            self?.handleWalletEvent(event)
        }
    }
    
    func disconnect() {
        // socket?.disconnect()
        subscriptions.values.forEach { $0.cancel() }
        subscriptions.removeAll()
        isConnected = false
    }
    
    // Subscribe to a channel
    func subscribe(_ channel: String, handler: @escaping (WebSocketEvent) -> Void) {
        // Socket.IO subscription implementation (pending SDK)
        // When Socket.IO Swift client is available:
        // socket?.on(channel) { [weak self] data, ack in
        //     let event = WebSocketEvent(channel: channel, data: data)
        //     self?.lastEvent = event
        //     handler(event)
        // }
        
        // Placeholder: Store subscription for future implementation
        // When Socket.IO is integrated, this will be replaced with actual socket subscription
    }
    
    // Unsubscribe from a channel
    func unsubscribe(_ channel: String) {
        subscriptions[channel]?.cancel()
        subscriptions.removeValue(forKey: channel)
    }
    
    // MARK: - Event Handlers
    
    private func handleSyncEvent(_ event: WebSocketEvent) {
        // Handle sync events (library, progress, preferences updates from other devices)
        NotificationCenter.default.post(
            name: .syncEventReceived,
            object: nil,
            userInfo: ["event": event]
        )
    }
    
    private func handleParagraphCommentEvent(_ event: WebSocketEvent) {
        // Handle paragraph comment updates (new comments, likes, etc.)
        NotificationCenter.default.post(
            name: .paragraphCommentEventReceived,
            object: nil,
            userInfo: ["event": event]
        )
    }
    
    private func handleWalletEvent(_ event: WebSocketEvent) {
        // Handle wallet balance updates
        NotificationCenter.default.post(
            name: .walletEventReceived,
            object: nil,
            userInfo: ["event": event]
        )
    }
}

// MARK: - WebSocket Event Model

struct WebSocketEvent {
    let channel: String
    let data: [Any]
    let timestamp: Date
    
    init(channel: String, data: [Any]) {
        self.channel = channel
        self.data = data
        self.timestamp = Date()
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let syncEventReceived = Notification.Name("syncEventReceived")
    static let paragraphCommentEventReceived = Notification.Name("paragraphCommentEventReceived")
    static let walletEventReceived = Notification.Name("walletEventReceived")
}

