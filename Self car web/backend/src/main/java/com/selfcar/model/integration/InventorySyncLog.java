package com.selfcar.model.integration;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_sync_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventorySyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dealership_id", nullable = false)
    private Long dealershipId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_type", nullable = false)
    private SyncType syncType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SyncStatus status = SyncStatus.PENDING;

    @Column(name = "items_added")
    private Integer itemsAdded = 0;

    @Column(name = "items_updated")
    private Integer itemsUpdated = 0;

    @Column(name = "items_deleted")
    private Integer itemsDeleted = 0;

    @Column(columnDefinition = "TEXT")
    private String errors;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum SyncType {
        FULL,
        INCREMENTAL
    }

    public enum SyncStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }
}

