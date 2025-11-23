package com.selfcar.service.pricing;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DynamicPricingService {

    public long predictPriceMinor(Long listingId) {
        // TODO: call ML model or feature store; return stub for now
        long base = 5000_00L;
        long mod = (listingId == null ? 0 : listingId % 100) * 100;
        long price = base + mod;
        log.debug("Predicted priceMinor={} for listing {}", price, listingId);
        return price;
    }
}


