package com.adaptive.planner.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
@EnableConfigurationProperties(InsightsProperties.class)
public class TimeConfig {

    @Bean
    Clock applicationClock(InsightsProperties properties) {
        return Clock.system(properties.zoneId());
    }
}
