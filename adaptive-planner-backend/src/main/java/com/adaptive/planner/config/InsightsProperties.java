package com.adaptive.planner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.ZoneId;

@ConfigurationProperties(prefix = "app.insights")
public record InsightsProperties(String timezone, String canonicalUserKey) {

    public InsightsProperties {
        timezone = timezone == null || timezone.isBlank() ? "Asia/Ho_Chi_Minh" : timezone;
        canonicalUserKey = canonicalUserKey == null || canonicalUserKey.isBlank()
                ? "single-user"
                : canonicalUserKey;
        ZoneId.of(timezone);
    }

    public ZoneId zoneId() {
        return ZoneId.of(timezone);
    }
}
