package com.campushub.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

@Configuration
public class DateTimeConfig {

    public static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone(BUSINESS_ZONE));
    }

    @Bean
    public Clock clock() {
        return Clock.system(BUSINESS_ZONE);
    }
}
