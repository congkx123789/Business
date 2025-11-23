import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Saved Search Store (FE-052)
 * 
 * Manages saved searches both locally and for authenticated users.
 * Local searches are stored in localStorage.
 * Account searches will sync with backend when authenticated.
 */
const useSavedSearchStore = create(
  persist(
    (set, get) => ({
      localSearches: [],
      accountSearches: [],
      
      /**
       * Add a saved search (local or account)
       */
      addSavedSearch: (searchParams, name = null) => {
        const { localSearches } = get()
        const searchId = `local_${Date.now()}`
        const searchName = name || `Search ${new Date().toLocaleDateString()}`
        
        const newSearch = {
          id: searchId,
          name: searchName,
          params: searchParams,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          type: 'local',
        }
        
        // Keep only last 10 local searches
        const updatedSearches = [newSearch, ...localSearches].slice(0, 10)
        
        set({ localSearches: updatedSearches })
        return newSearch
      },
      
      /**
       * Delete a saved search
       */
      deleteSavedSearch: (searchId) => {
        const { localSearches, accountSearches } = get()
        
        if (searchId.startsWith('local_')) {
          set({
            localSearches: localSearches.filter(s => s.id !== searchId)
          })
        } else {
          set({
            accountSearches: accountSearches.filter(s => s.id !== searchId)
          })
          // TODO: Sync with backend when authenticated
        }
      },
      
      /**
       * Update last used timestamp
       */
      updateLastUsed: (searchId) => {
        const { localSearches, accountSearches } = get()
        
        if (searchId.startsWith('local_')) {
          set({
            localSearches: localSearches.map(s => 
              s.id === searchId 
                ? { ...s, lastUsed: new Date().toISOString() }
                : s
            )
          })
        } else {
          set({
            accountSearches: accountSearches.map(s => 
              s.id === searchId 
                ? { ...s, lastUsed: new Date().toISOString() }
                : s
            )
          })
        }
      },
      
      /**
       * Get all saved searches (local + account)
       */
      getAllSearches: () => {
        const { localSearches, accountSearches } = get()
        return [...accountSearches, ...localSearches].sort((a, b) => 
          new Date(b.lastUsed) - new Date(a.lastUsed)
        )
      },
      
      /**
       * Sync account searches with backend (to be implemented)
       */
      syncAccountSearches: async () => {
        // TODO: Fetch from backend API when authenticated
        // For now, this is a placeholder
        return []
      },
    }),
    {
      name: 'saved-search-storage',
    }
  )
)

export default useSavedSearchStore

