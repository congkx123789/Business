package com.selfcar.security;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * LogSanitizer ensures no PAN or sensitive data appears in telemetry/logs.
 */
public final class LogSanitizer {
    private static final Pattern PAN_LIKE = Pattern.compile("\\b(?:\\d[ -]*?){13,19}\\b");
    private static final Pattern SECRET_KEYS = Pattern.compile("(?i)(secret|password|token|key)");

    private LogSanitizer() {}

    public static Map<String, Object> sanitize(Map<String, Object> input) {
        if (input == null) return Map.of();
        Map<String, Object> out = new HashMap<>();
        input.forEach((k, v) -> {
            Object value = v;
            if (value instanceof String s) {
                // Mask PAN-like and secrets
                if (PAN_LIKE.matcher(s).find() || SECRET_KEYS.matcher(k).find()) {
                    value = "[REDACTED]";
                }
            }
            out.put(k, value);
        });
        return out;
    }
}

