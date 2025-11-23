package com.selfcar.repository.common;

import com.selfcar.model.common.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, Notification.NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.read = false")
    Long countUnreadNotificationsByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId " +
           "AND n.relatedEntityType = :entityType AND n.relatedEntityId = :entityId " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndRelatedEntity(@Param("userId") Long userId,
                                                   @Param("entityType") String entityType,
                                                   @Param("entityId") Long entityId);
}
