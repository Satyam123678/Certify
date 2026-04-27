package com.satyam.api_getway.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtGateWayFilter implements GlobalFilter , Ordered {

    private final WebClient.Builder webClientBuilder;

    public JwtGateWayFilter(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    // Paths that don't need token
    private final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/validate",
            "/api/auth/refresh",
            "/api/auth/logout"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path=exchange.getRequest().getPath().toString();

        System.out.println("Gateway received request: " + path);

        if(PUBLIC_PATHS.stream().anyMatch(path::startsWith)){
            return chain.filter(exchange);
        }
        String authHeader=exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token=authHeader.substring(7);
       // WebClient webClient = WebClient.create("http://localhost:8085");

        return webClientBuilder.build().get().uri("lb://user-service/api/auth/validate?token=" + token)
                .retrieve()
                .bodyToMono(Boolean.class)
                .flatMap(isValid->{
                    if(Boolean.TRUE.equals(isValid)){
                        return chain.filter(exchange);
                    }
                    else{
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }
                })
                .onErrorResume(e->{
                    exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
                    return exchange.getResponse().setComplete();
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
