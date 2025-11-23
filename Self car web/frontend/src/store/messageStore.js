import { create } from 'zustand'

// Mock data for demonstration - in production, this would come from API
const initialConversations = [
  {
    id: '1',
    participants: [
      { id: 2, name: 'Admin User', email: 'admin@selfcar.com', role: 'ADMIN' },
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'CUSTOMER' }
    ],
    messages: [
      {
        id: 'm1',
        senderId: 1,
        text: 'Hello! I\'m interested in the Toyota Camry. Is it available?',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      },
      {
        id: 'm2',
        senderId: 2,
        text: 'Hi! Yes, the Camry is available. Would you like to book it?',
        timestamp: new Date(Date.now() - 86000000).toISOString(),
        read: true
      },
      {
        id: 'm3',
        senderId: 1,
        text: 'Yes, I\'d like to book it for this weekend.',
        timestamp: new Date(Date.now() - 85000000).toISOString(),
        read: false
      }
    ]
  },
  {
    id: '2',
    participants: [
      { id: 3, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'CUSTOMER' },
      { id: 2, name: 'Admin User', email: 'admin@selfcar.com', role: 'ADMIN' }
    ],
    messages: [
      {
        id: 'm4',
        senderId: 3,
        text: 'Hi, can you tell me more about the Tesla Model 3?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: 'm5',
        senderId: 2,
        text: 'Sure! The Tesla Model 3 is an electric sedan with autopilot features and long range.',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        read: false
      }
    ]
  }
]

const useMessageStore = create((set, get) => ({
  conversations: initialConversations || [],
  activeConversation: null,

  setActiveConversation: (conversationId) => {
    if (!conversationId) return
    set({ activeConversation: conversationId })
    // Mark messages as read when opening conversation
    const conversations = get().conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: (conv.messages || []).map(msg => ({ ...msg, read: true }))
        }
      }
      return conv
    })
    set({ conversations })
  },

  sendMessage: (conversationId, text, senderId) => {
    if (!conversationId || !text || !senderId) {
      console.error('Invalid message data:', { conversationId, text, senderId })
      return
    }

    const newMessage = {
      id: `m${Date.now()}`,
      senderId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false
    }

    const conversations = get().conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...(conv.messages || []), newMessage]
        }
      }
      return conv
    })

    set({ conversations })
  },

  createConversation: (participants) => {
    const newConversation = {
      id: `conv${Date.now()}`,
      participants,
      messages: []
    }

    set(state => ({
      conversations: [...state.conversations, newConversation],
      activeConversation: newConversation.id
    }))

    return newConversation.id
  },

  getUnreadCount: (userId) => {
    const { conversations } = get()
    if (!userId) return 0
    return conversations.reduce((total, conv) => {
      return total + conv.messages.filter(
        m => !m.read && m.senderId !== userId
      ).length
    }, 0)
  }
}))

export default useMessageStore

