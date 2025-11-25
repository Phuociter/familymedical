package com.example.famMedical.config;

import com.example.famMedical.service.JwtService;
import com.example.famMedical.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

/**
 * WebSocket Configuration for GraphQL Subscriptions
 * Handles WebSocket connections and JWT authentication for subscriptions
 */
@Configuration
public class WebSocketConfig {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public WebSocketConfig(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * WebSocket GraphQL Interceptor for JWT Authentication
     * Extracts JWT token from connection params and validates it
     * Sets authenticated user in GraphQL context for subscription resolvers
     */
    @Bean
    public WebGraphQlInterceptor webSocketAuthInterceptor() {
        return (request, chain) -> {
            // Try to get token from headers first (for regular HTTP requests)
            String authHeader = request.getHeaders().getFirst("Authorization");
            String token = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else {
                // Try to get token from connection params (WebSocket handshake)
                try {
                    Map<String, Object> connectionParams = request.toExecutionInput()
                            .getGraphQLContext()
                            .get("connectionParams");
                    
                    if (connectionParams != null) {
                        Object authTokenObj = connectionParams.get("authToken");
                        if (authTokenObj != null) {
                            token = authTokenObj.toString();
                            
                            // Remove "Bearer " prefix if present
                            if (token.startsWith("Bearer ")) {
                                token = token.substring(7);
                            }
                        }
                    }
                } catch (Exception e) {
                    // Connection params might not be available for regular HTTP requests
                }
            }
            
            if (token != null) {
                try {
                    // Validate token and extract user
                    if (jwtService.validateToken(token)) {
                        String userEmail = jwtService.extractUsername(token);
                        
                        var userOptional = userRepository.findByEmail(userEmail);
                        if (userOptional.isPresent()) {
                            UserDetails userDetails = userOptional.get();
                            
                            // Set authentication in context
                            UsernamePasswordAuthenticationToken authToken = 
                                new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                                );
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            
                            // Add user to GraphQL context
                            request.configureExecutionInput((executionInput, builder) ->
                                builder.graphQLContext(context -> 
                                    context.put("currentUser", userDetails)
                                ).build()
                            );
                        }
                    }
                } catch (Exception e) {
                    // Log authentication failure but don't block the request
                    // Subscription resolvers will handle unauthorized access
                    System.err.println("WebSocket authentication failed: " + e.getMessage());
                }
            }
            
            return chain.next(request);
        };
    }
}
