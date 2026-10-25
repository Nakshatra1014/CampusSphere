package com.campushub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CampusHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusHubApplication.class, args);
    }
}
