package com.example.famMedical.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import reactor.core.publisher.Mono;

/**
 * GraphQL Configuration
 * Configures GraphQL endpoint settings and context
 */
@Configuration
public class GraphQLConfig {

    /**
     * Interceptor to add HTTP headers to GraphQL context
     * This allows resolvers to access the Authorization header for JWT authentication
     */
    @Bean
    public WebGraphQlInterceptor authorizationInterceptor() {
        return (request, chain) -> {
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null) {
                request.configureExecutionInput((executionInput, builder) ->
                    builder.graphQLContext(context -> context.put("authorization", authHeader)).build()
                );
            }
            return chain.next(request);
        };
    }
}
