import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Send, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useMessageStore from '../store/messageStore'
import toast from 'react-hot-toast'

/**
 * Messages Page
 * 
 * API Integration Points (Ready for backend expansion):
 * - GET /api/conversations - Fetch user conversations
 * - GET /api/conversations/:id/messages - Fetch messages for a conversation
 * - POST /api/conversations/:id/messages - Send a new message
 * - POST /api/conversations - Create a new conversation
 * - PUT /api/conversations/:id/read - Mark conversation as read
 * - WebSocket /ws/messages/:conversationId - Real-time message updates
 * 
 * Current implementation uses local state (Zustand) for demo purposes.
 * Replace useMessageStore calls with API hooks when backend is ready.
 */

const Messages = () => {
  const { user } = useAuthStore()
  const { conversations, activeConversation, setActiveConversation, sendMessage } = useMessageStore()
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Filter conversations based on search
  const filteredConversations = conversations?.filter(conv => {
    if (!conv.participants) return false
    const otherUser = conv.participants.find(p => p.id !== user?.id)
    if (!otherUser) return false
    const nameMatch = otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const emailMatch = otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return searchQuery === '' || nameMatch || emailMatch
  }) || []

  // Get active conversation data
  const activeConv = conversations.find(c => c.id === activeConversation)
  const otherUser = activeConv?.participants.find(p => p.id !== user?.id)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation || !user?.id) {
      if (!user?.id) {
        toast.error('Please login to send messages')
        navigate('/login')
      }
      return
    }

    try {
      // TODO: Replace with API call when backend is ready
      // await messageAPI.sendMessage(activeConversation, messageText)
      
      // Current: Local state (for demo)
      sendMessage(activeConversation, messageText, user.id)
      setMessageText('')
      toast.success('Message sent!')
    } catch (error) {
      toast.error('Failed to send message')
      console.error('Error sending message:', error)
    }
  }

  // TODO: Add API hooks for fetching conversations
  // const { data: conversations, isLoading } = useConversations()
  
  // TODO: Add WebSocket connection for real-time updates
  // useEffect(() => {
  //   const ws = new WebSocket(`ws://localhost:8080/ws/messages/${activeConversation}`)
  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data)
  //     // Handle new message
  //   }
  //   return () => ws.close()
  // }, [activeConversation])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Select first conversation by default
  useEffect(() => {
    if (!activeConversation && filteredConversations.length > 0) {
      setActiveConversation(filteredConversations[0].id)
    }
  }, [activeConversation, filteredConversations, setActiveConversation])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view messages</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Left Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-primary-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle size={24} />
                    Messages
                  </h2>
                  <button className="p-1 hover:bg-primary-700 rounded">
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-200" size={18} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start a conversation by booking a car!</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.participants?.find(p => p.id !== user.id)
                    const lastMessage = conversation.messages && conversation.messages.length > 0 
                      ? conversation.messages[conversation.messages.length - 1]
                      : null
                    const isActive = activeConversation === conversation.id
                    const unreadCount = conversation.messages?.filter(
                      m => !m.read && m.senderId !== user.id
                    ).length || 0

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setActiveConversation(conversation.id)}
                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                          isActive ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {otherParticipant?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherParticipant?.name || 'Unknown User'}
                              </h3>
                              {lastMessage && (
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {lastMessage?.text || 'No messages yet'}
                              </p>
                              {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0 ml-2">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {otherParticipant?.role === 'ADMIN' ? 'Seller' : 'Buyer'}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Side - Chat Window */}
            <div className="flex-1 flex flex-col">
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                        {otherUser?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{otherUser?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-500">
                          {otherUser?.role === 'ADMIN' ? 'Seller' : 'Buyer'} • {otherUser?.email}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                    {!activeConv.messages || activeConv.messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-20">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      activeConv.messages.map((message, idx) => {
                        const isOwnMessage = message.senderId === user.id
                        const isLastMessage = idx === activeConv.messages.length - 1
                        const showAvatar = isLastMessage || 
                          (idx < activeConv.messages.length - 1 && 
                           activeConv.messages[idx + 1].senderId !== message.senderId)

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {!isOwnMessage && showAvatar && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {otherUser?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                              {!isOwnMessage && !showAvatar && <div className="w-8"></div>}
                              <div className={`px-4 py-2 rounded-2xl ${
                                isOwnMessage 
                                  ? 'bg-primary-600 text-white rounded-br-none' 
                                  : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                              }`}>
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${
                                  isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages

