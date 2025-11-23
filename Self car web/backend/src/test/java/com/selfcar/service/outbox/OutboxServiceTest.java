package com.selfcar.service.outbox;

import com.selfcar.model.outbox.OutboxEvent;
import com.selfcar.repository.outbox.OutboxEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxServiceTest {

    @Mock OutboxEventRepository outboxEventRepository;
    @Mock ListingSearchProjector listingSearchProjector;
    @Mock com.selfcar.service.search.SearchIndexerService searchIndexerService;

    @InjectMocks OutboxService outboxService;

    @Test
    void publishPendingBatch_projectsAndMarksPublished() {
        OutboxEvent e = OutboxEvent.builder()
                .id(1L)
                .aggregateType("LISTING")
                .aggregateId(10L)
                .eventType("LISTING_STATUS_CHANGED")
                .payload("{\"listingId\":10,\"status\":\"AVAILABLE\"}")
                .status(OutboxEvent.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        Page<OutboxEvent> page = new PageImpl<>(List.of(e), PageRequest.of(0, 10), 1);
        when(outboxEventRepository.findByStatusOrderByCreatedAtAsc(eq(OutboxEvent.Status.PENDING), any(PageRequest.class)))
                .thenReturn(page);
        when(outboxEventRepository.save(any(OutboxEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        int published = outboxService.publishPendingBatch(10);
        assertEquals(1, published);
        verify(listingSearchProjector).upsertFromEvent(eq("LISTING_STATUS_CHANGED"), any(Map.class));
        verify(searchIndexerService).indexOrDeleteFromPayload(eq("LISTING_STATUS_CHANGED"), any(Map.class));
        verify(outboxEventRepository, atLeastOnce()).save(any(OutboxEvent.class));
    }
}


