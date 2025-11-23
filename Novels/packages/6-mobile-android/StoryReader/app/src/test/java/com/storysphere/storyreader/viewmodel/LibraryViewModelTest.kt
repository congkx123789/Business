package com.storysphere.storyreader.viewmodel

import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.repository.LibraryRepository
import io.mockk.*
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*

class LibraryViewModelTest {
    
    private lateinit var repository: LibraryRepository
    private lateinit var viewModel: LibraryViewModel
    
    @Before
    fun setup() {
        repository = mockk()
        viewModel = LibraryViewModel(repository)
    }
    
    @Test
    fun `loadLibrary should update libraryItems when successful`() = runTest {
        // Given
        val userId = "user1"
        val expectedItems = listOf(
            Library(
                id = "lib1",
                userId = userId,
                storyId = "story1",
                addedAt = System.currentTimeMillis(),
                lastReadAt = null,
                isFavorite = false,
                syncStatus = SyncStatus.SYNCED,
                lastSyncedAt = System.currentTimeMillis()
            )
        )
        
        every { repository.getLibrary(userId) } returns flowOf(expectedItems)
        
        // When
        viewModel.loadLibrary(userId)
        
        // Wait for flow to emit
        kotlinx.coroutines.delay(100)
        
        // Then
        assertEquals(expectedItems, viewModel.libraryItems.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
        
        verify { repository.getLibrary(userId) }
    }
    
    @Test
    fun `loadLibrary should set error when repository fails`() = runTest {
        // Given
        val userId = "user1"
        val errorMessage = "Network error"
        val exception = Exception(errorMessage)
        
        every { repository.getLibrary(userId) } returns flow {
            throw exception
        }
        
        // When
        viewModel.loadLibrary(userId)
        
        // Wait for error handling
        kotlinx.coroutines.delay(500)
        
        // Then
        assertTrue(viewModel.error.value?.contains(errorMessage) == true || 
                   viewModel.error.value?.contains("retries") == true)
        assertFalse(viewModel.isLoading.value)
        
        verify { repository.getLibrary(userId) }
    }
    
    @Test
    fun `addToLibrary should perform optimistic update`() = runTest {
        // Given
        val userId = "user1"
        val storyId = "story1"
        val initialItems = emptyList<Library>()
        
        every { repository.getLibrary(userId) } returns flowOf(initialItems)
        every { repository.addToLibrary(userId, storyId) } returns Result.success(Unit)
        
        // When
        viewModel.loadLibrary(userId)
        kotlinx.coroutines.delay(100)
        
        viewModel.addToLibrary(userId, storyId)
        kotlinx.coroutines.delay(100)
        
        // Then
        verify { repository.addToLibrary(userId, storyId) }
        // Optimistic update should add item immediately
        assertTrue(viewModel.libraryItems.value.isNotEmpty())
    }
    
    @Test
    fun `removeFromLibrary should perform optimistic update`() = runTest {
        // Given
        val userId = "user1"
        val storyId = "story1"
        val libraryItem = Library(
            id = "lib1",
            userId = userId,
            storyId = storyId,
            addedAt = System.currentTimeMillis(),
            lastReadAt = null,
            isFavorite = false,
            syncStatus = SyncStatus.SYNCED,
            lastSyncedAt = System.currentTimeMillis()
        )
        
        every { repository.getLibrary(userId) } returns flowOf(listOf(libraryItem))
        every { repository.removeFromLibrary(userId, storyId) } returns Result.success(Unit)
        
        // When
        viewModel.loadLibrary(userId)
        kotlinx.coroutines.delay(100)
        
        val initialCount = viewModel.libraryItems.value.size
        viewModel.removeFromLibrary(userId, storyId)
        kotlinx.coroutines.delay(100)
        
        // Then
        verify { repository.removeFromLibrary(userId, storyId) }
        // Optimistic update should remove item immediately
        assertTrue(viewModel.libraryItems.value.size < initialCount)
    }
    
    @Test
    fun `retry should reset retry count and reload library`() = runTest {
        // Given
        val userId = "user1"
        val expectedItems = listOf(
            Library(
                id = "lib1",
                userId = userId,
                storyId = "story1",
                addedAt = System.currentTimeMillis(),
                lastReadAt = null,
                isFavorite = false,
                syncStatus = SyncStatus.SYNCED,
                lastSyncedAt = System.currentTimeMillis()
            )
        )
        
        every { repository.getLibrary(userId) } returns flowOf(expectedItems)
        
        // When
        viewModel.retry()
        kotlinx.coroutines.delay(100)
        
        // Then
        assertEquals(expectedItems, viewModel.libraryItems.value)
        verify { repository.getLibrary(userId) }
    }
    
    @Test
    fun `clearError should reset error state`() = runTest {
        // Given
        val userId = "user1"
        val exception = Exception("Test error")
        
        every { repository.getLibrary(userId) } returns flow {
            throw exception
        }
        
        viewModel.loadLibrary(userId)
        kotlinx.coroutines.delay(500)
        
        // When
        viewModel.clearError()
        
        // Then
        assertNull(viewModel.error.value)
    }
}

