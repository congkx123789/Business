package com.selfcar.repository.common;

import com.selfcar.model.common.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommonOutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    @Query(value = "select * from outbox_events where status = 'PENDING' order by id asc limit ?1", nativeQuery = true)
    List<OutboxEvent> findPendingBatch(int limit);
}


