package com.email.writer.app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()

                .filter((request, next) -> next.exchange(request)
                        .flatMap(clientResponse -> {

                            if (clientResponse.statusCode().is5xxServerError()) {
                                return clientResponse.createException().flatMap(Mono::error);
                            }
                            return Mono.just(clientResponse);
                        })
                        .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                                .jitter(0.5)
                                .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) ->
                                        new RuntimeException("External API service failed to respond after multiple retries.", retrySignal.failure())
                                )
                        )
                )
                .build();
    }
}