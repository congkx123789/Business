package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.NotificationEntity
import com.storysphere.storyreader.model.Notification
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    // Offline-First: Load from Room first, sync in background
    fun getNotifications(userId: String): Flow<List<Notification>> {
        return database.notificationDao().getNotifications(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }
    
    fun getUnreadNotifications(userId: String): Flow<List<Notification>> {
        return database.notificationDao().getUnreadNotifications(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }
    
    fun getUnreadCount(userId: String): Flow<Int> {
        return database.notificationDao().getUnreadCount(userId)
    }
    
    suspend fun markAsRead(notificationId: String) {
        database.notificationDao().markAsRead(notificationId)
        // TODO: Sync to backend
    }
    
    suspend fun markAllAsRead(userId: String) {
        database.notificationDao().markAllAsRead(userId)
        // TODO: Sync to backend
    }
    
    suspend fun deleteNotification(notificationId: String) {
        database.notificationDao().deleteNotification(notificationId)
        // TODO: Sync to backend
    }
}

private fun NotificationEntity.toModel(): Notification {
    return Notification(
        id = id,
        userId = userId,
        type = type,
        title = title,
        message = message,
        relatedId = relatedId,
        isRead = isRead,
        createdAt = createdAt
    )
}

private fun Notification.toEntity(): NotificationEntity {
    return NotificationEntity(
        id = id,
        userId = userId,
        type = type,
        title = title,
        message = message,
        relatedId = relatedId,
        isRead = isRead,
        createdAt = createdAt
    )
}

