package com.selfcar.repository.integration;

import com.selfcar.model.integration.InventorySyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventorySyncLogRepository extends JpaRepository<InventorySyncLog, Long> {
    List<InventorySyncLog> findByDealershipId(Long dealershipId);
    List<InventorySyncLog> findByStatus(InventorySyncLog.SyncStatus status);
}

