package com.selfcar.service.listing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class ListingHoldExpiryJob {

    private final JdbcTemplate jdbcTemplate;

    // Runs every minute to expire holds
    @Scheduled(fixedDelay = 60000)
    public void expireHolds() {
        try {
            List<Long> expiredListingIds = jdbcTemplate.query(
                    "SELECT listing_id FROM listing_holds WHERE expires_at < NOW()",
                    (rs, i) -> rs.getLong(1)
            );

            if (expiredListingIds.isEmpty()) return;

            int cleared = jdbcTemplate.update("DELETE FROM listing_holds WHERE expires_at < NOW()");
            int flipped = 0;
            for (Long listingId : expiredListingIds) {
                // Audit before flipping
                jdbcTemplate.update(
                    "INSERT INTO listing_status_audit (listing_id, old_status, new_status, reason) " +
                    "SELECT id, status, 'AVAILABLE', 'HOLD_EXPIRED' FROM listings WHERE id = ?",
                    listingId
                );
                flipped += jdbcTemplate.update(
                        "UPDATE listings SET status = 'AVAILABLE', updated_at = NOW() WHERE id = ? AND status IN ('RESERVED','EXPIRED_HOLD')",
                        listingId
                );
            }
            log.info("LISTING_HOLDS_EXPIRED: cleared={}, flipped_available={}, at={}", cleared, flipped, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error expiring listing holds", e);
        }
    }
}


