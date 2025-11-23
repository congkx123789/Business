package com.selfcar.service.common;

import com.selfcar.model.common.Notification;
import com.selfcar.model.auth.User;
import com.selfcar.repository.common.NotificationRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<Notification> getUserNotifications(Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadCount(Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        return notificationRepository.countUnreadNotificationsByUserId(userId);
    }

    public Notification getNotificationById(Long id) {
        Objects.requireNonNull(id, "Notification ID cannot be null");
        return notificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Notification not found with ID: {}", id);
                    return new RuntimeException("Notification not found with id: " + id);
                });
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message,
                                          Notification.NotificationType type,
                                          String relatedEntityType, Long relatedEntityId) {
        Objects.requireNonNull(userId, "User ID is required");
        Objects.requireNonNull(title, "Title is required");
        Objects.requireNonNull(message, "Message is required");
        Objects.requireNonNull(type, "Notification type is required");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        log.debug("Creating notification for user ID: {} with title: {}", userId, title);
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(Notification.NotificationStatus.UNREAD);
        notification.setRead(false);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message,
                                          Notification.NotificationType type,
                                          String actionUrl) {
        Objects.requireNonNull(userId, "User ID is required");
        Objects.requireNonNull(title, "Title is required");
        Objects.requireNonNull(message, "Message is required");
        Objects.requireNonNull(type, "Notification type is required");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        log.debug("Creating notification for user ID: {} with title: {}", userId, title);
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(Notification.NotificationStatus.UNREAD);
        notification.setRead(false);
        notification.setActionUrl(actionUrl);

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.markAsRead();
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        Objects.requireNonNull(userId, "User ID cannot be null");
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        notifications.forEach(Notification::markAsRead);
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteNotification(Long id) {
        Objects.requireNonNull(id, "Notification ID cannot be null");
        notificationRepository.deleteById(id);
    }
}
