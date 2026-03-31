package com.SyncClinic.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                // 1. Disable CSRF so Postman can actually send POST requests
                .csrf(csrf -> csrf.disable())

                // 2. Let our custom AuthenticationFilter handle the security,
                // so we tell Spring Security to just let the traffic flow through.
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll()
                );

        return http.build();
    }

}
