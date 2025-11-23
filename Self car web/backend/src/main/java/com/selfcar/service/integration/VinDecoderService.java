package com.selfcar.service.integration;

import lombok.Builder;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class VinDecoderService {

    @Value
    @Builder
    public static class VinInfo {
        private final String make;   // normalized brand
        private final String model;
        private final Integer year;
        private final String trim;
    }

    public VinInfo decode(String vin) {
        if (vin == null || vin.length() < 5) {
            return VinInfo.builder().make(null).model(null).year(null).trim(null).build();
        }
        // TODO: call external VIN decoding API; stub normalization
        String wmi = vin.substring(0, 3).toUpperCase();
        String make = switch (wmi) {
            case "1HG" -> "Honda";
            case "1FA" -> "Ford";
            case "WVW" -> "Volkswagen";
            default -> "Unknown";
        };
        Integer year = 2015 + (Math.abs(vin.hashCode()) % 10);
        String model = "MODEL-" + vin.substring(3, 5).toUpperCase();
        String trim = (Math.abs(vin.hashCode()) % 2 == 0) ? "Base" : "Sport";
        log.debug("Decoded VIN {} => {} {} {} {}", vin, year, make, model, trim);
        return VinInfo.builder().make(make).model(model).year(year).trim(trim).build();
    }
}


