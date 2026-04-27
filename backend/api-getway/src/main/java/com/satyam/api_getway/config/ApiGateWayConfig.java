package com.satyam.api_getway.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class ApiGateWayConfig {
 @Autowired
 RateLimitterConfig rateLimitterConfig;
    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder){
        return builder.routes()
                 ///userService
                .route("user-service", r -> r
                        .path("/api/auth/**")
                        .filters(f->f
                                .requestRateLimiter(config->config
                                        .setRateLimiter(rateLimitterConfig.redisRateLimiter())
                                        .setKeyResolver(rateLimitterConfig.keyResolver())
                                )
                        )
                        .uri("lb://user-service"))
                //questService
                .route("question-service",r->r.path("/api/question/**")
                        .filters(f->f.requestRateLimiter(config -> config.setRateLimiter(rateLimitterConfig.redisRateLimiter()).setKeyResolver(rateLimitterConfig.keyResolver())))
                        .uri("lb://question-service"))
               //quizService
                .route("quiz-service",r->r.path("/api/quiz/**")
                        .filters(f->f.requestRateLimiter(config -> config.setRateLimiter(rateLimitterConfig.redisRateLimiter()).setKeyResolver(rateLimitterConfig.keyResolver())))
                        .uri("lb://quiz-service")).build();
    }
}
