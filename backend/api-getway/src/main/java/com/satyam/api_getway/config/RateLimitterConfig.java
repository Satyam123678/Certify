package com.satyam.api_getway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimitterConfig {
    @Bean
   public RedisRateLimiter redisRateLimiter(){
      return new RedisRateLimiter(
               10,   // replenishRate  — requests per second
               20, // burstCapacity  — max burst requests
               1 // requestedTokens — tokens per request
       );
   }
   @Bean
    public KeyResolver keyResolver(){
        return exchange -> Mono.just(exchange.getRequest().getRemoteAddress().getAddress().getHostName());
   }

}
