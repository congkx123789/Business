package com.storysphere.storyreader.network

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebSocketService @Inject constructor() {
    private var socket: Socket? = null
    private val _connectionStatus = MutableStateFlow<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
    val connectionStatus: StateFlow<ConnectionStatus> = _connectionStatus.asStateFlow()
    
    private val _paragraphComments = MutableStateFlow<List<ParagraphCommentEvent>>(emptyList())
    val paragraphComments: StateFlow<List<ParagraphCommentEvent>> = _paragraphComments.asStateFlow()
    
    private val _walletUpdates = MutableStateFlow<WalletUpdateEvent?>(null)
    val walletUpdates: StateFlow<WalletUpdateEvent?> = _walletUpdates.asStateFlow()
    
    private val _purchaseUpdates = MutableStateFlow<PurchaseEvent?>(null)
    val purchaseUpdates: StateFlow<PurchaseEvent?> = _purchaseUpdates.asStateFlow()
    
    fun connect(baseUrl: String, token: String) {
        try {
            val options = IO.Options().apply {
                auth = JSONObject().apply {
                    put("token", token)
                }
            }
            
            socket = IO.socket(baseUrl, options).apply {
                on(Socket.EVENT_CONNECT) {
                    _connectionStatus.value = ConnectionStatus.CONNECTED
                    Log.d("WebSocketService", "Connected")
                }
                
                on(Socket.EVENT_DISCONNECT) {
                    _connectionStatus.value = ConnectionStatus.DISCONNECTED
                    Log.d("WebSocketService", "Disconnected")
                }
                
                on(Socket.EVENT_CONNECT_ERROR) { args ->
                    _connectionStatus.value = ConnectionStatus.ERROR
                    Log.e("WebSocketService", "Connection error: ${args[0]}")
                }
                
                // Paragraph Comments Events
                on("paragraph.comment.created") { args ->
                    val event = args[0] as? JSONObject
                    event?.let {
                        // Handle paragraph comment created
                    }
                }
                
                // Wallet Updates
                on("wallet.balance.updated") { args ->
                    val event = args[0] as? JSONObject
                    event?.let {
                        _walletUpdates.value = WalletUpdateEvent(
                            userId = it.getString("userId"),
                            newBalance = it.getInt("balance")
                        )
                    }
                }
                
                // Purchase Updates
                on("purchase.completed") { args ->
                    val event = args[0] as? JSONObject
                    event?.let {
                        _purchaseUpdates.value = PurchaseEvent(
                            userId = it.getString("userId"),
                            chapterId = it.getString("chapterId"),
                            success = it.getBoolean("success")
                        )
                    }
                }
            }
            
            socket?.connect()
        } catch (e: Exception) {
            Log.e("WebSocketService", "Error connecting", e)
            _connectionStatus.value = ConnectionStatus.ERROR
        }
    }
    
    fun subscribe(channel: String) {
        socket?.emit("subscribe", channel)
    }
    
    fun unsubscribe(channel: String) {
        socket?.emit("unsubscribe", channel)
    }
    
    fun disconnect() {
        socket?.disconnect()
        socket = null
        _connectionStatus.value = ConnectionStatus.DISCONNECTED
    }
}

enum class ConnectionStatus {
    CONNECTED,
    DISCONNECTED,
    CONNECTING,
    ERROR
}

data class ParagraphCommentEvent(
    val chapterId: String,
    val paragraphIndex: Int,
    val commentId: String,
    val content: String
)

data class WalletUpdateEvent(
    val userId: String,
    val newBalance: Int
)

data class PurchaseEvent(
    val userId: String,
    val chapterId: String,
    val success: Boolean
)

