package com.stockpred.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PredictionController {

    private final WebClient webClient;

    public PredictionController(@Value("${ml.service.url}") String mlServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(mlServiceUrl)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @GetMapping("/predict/{ticker}")
    public Mono<Map> predict(@PathVariable String ticker) {
        // Forward request to Python ML service and return raw JSON
        return webClient.get()
                .uri("/predict/{ticker}", ticker)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(120));  // LSTM training can take time
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "Stock Predictor Backend");
    }
}
