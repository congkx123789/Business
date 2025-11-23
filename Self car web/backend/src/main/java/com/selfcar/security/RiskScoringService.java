package com.selfcar.security;

import lombok.Builder;
import lombok.Value;
import org.springframework.stereotype.Service;

/**
 * Risk Scoring Service (v0 stub)
 * Combines IP/Device/Velocity/Breached signals to a score and action.
 * Week 6: returns allow with low score; later weeks will add real signals.
 */
@Service
public class RiskScoringService {

    @Value
    @Builder
    public static class Decision {
        private final int score; // 0-100
        private final String action; // allow|challenge|step_up|block
        private final String[] reasons; // reason codes
    }

    public Decision evaluateLogin(String ip, String deviceId, String email,
                                  int velocitySignals, boolean breachedPasswordKnown) {
        // Week 6 baseline: permissive
        return Decision.builder()
                .score(5)
                .action("allow")
                .reasons(new String[]{"baseline_v0"})
                .build();
    }
}


