package com.inventory.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KeepAliveTask {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveTask.class);
    private final RestTemplate restTemplate = new RestTemplate();

    // The cron expression or fixed rate to run every 14 minutes.
    // 840000 ms = 14 minutes
    @Scheduled(fixedRate = 840000)
    public void pingRenderService() {
        try {
            // Get the URL from environment variable
            String url = System.getenv("RENDER_EXTERNAL_URL");
            
            // If the environment variable is not set (e.g. running locally), we skip
            if (url == null || url.trim().isEmpty()) {
                logger.info("RENDER_EXTERNAL_URL is not set. Skipping keep-alive ping.");
                return;
            }

            String pingUrl = url + "/api/ping";
            logger.info("Pinging service to keep it alive: {}", pingUrl);
            
            String response = restTemplate.getForObject(pingUrl, String.class);
            logger.info("Keep-alive ping response: {}", response);
        } catch (Exception e) {
            logger.error("Error pinging service: {}", e.getMessage());
        }
    }
}
