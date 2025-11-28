package com.example.famMedical.config;

import com.example.famMedical.service.JwtService;
import com.example.famMedical.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.graphql.server.WebSocketGraphQlInterceptor;
import org.springframework.graphql.server.WebSocketSessionInfo;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import reactor.core.publisher.Mono;

import java.util.Map;

@Configuration
public class WebSocketConfig {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public WebSocketConfig(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Bean
    public WebSocketGraphQlInterceptor webSocketInterceptor() {
        return new CustomWebSocketInterceptor(jwtService, userRepository);
    }

}

class CustomWebSocketInterceptor implements WebSocketGraphQlInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public CustomWebSocketInterceptor(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    @NonNull
    public Mono<Object> handleConnectionInitialization(@NonNull WebSocketSessionInfo sessionInfo, @NonNull Map<String, Object> connectionInitPayload) {
        System.out.println("=== WebSocket Connection Init ===");
        System.out.println("Session ID: " + sessionInfo.getId());
        
        String token = extractToken(connectionInitPayload);
        if (token == null) {
            System.err.println("❌ WebSocket: Token not found in connection payload");
            return Mono.error(new RuntimeException("Token not found in payload"));
        }

        try {
            if (jwtService.validateToken(token)) {
                String email = jwtService.extractUsername(token);
                var userOptional = userRepository.findByEmail(email);

                if (userOptional.isPresent()) {
                    UserDetails userDetails = userOptional.get();
                    
                    // LƯU Ý: Put vào session attributes.
                    // Spring sẽ tự động copy map này sang request attributes mỗi khi có query/mutation qua socket này.
                    sessionInfo.getAttributes().put("currentUser", userDetails);
                    sessionInfo.getAttributes().put("isAuthenticated", true);

                    System.out.println("✅ WebSocket authenticated for: " + email);
                    System.out.println("✅ WebSocket session established: " + sessionInfo.getId());
                    return Mono.just(Map.of("status", "connected", "user", email));
                } else {
                    System.err.println("❌ WebSocket: User not found: " + email);
                }
            } else {
                System.err.println("❌ WebSocket: Invalid JWT token");
            }
        } catch (Exception e) {
            System.err.println("❌ WebSocket auth failed: " + e.getMessage());
            e.printStackTrace();
        }
        return Mono.error(new RuntimeException("Unauthorized"));
    }

    @Override
    @NonNull
    public Mono<WebGraphQlResponse> intercept(@NonNull WebGraphQlRequest request, @NonNull Chain chain) {
        // Lấy user từ attributes (đã được copy từ SessionInfo sang Request)
        Object userObj = request.getAttributes().get("currentUser");

        if (userObj instanceof UserDetails userDetails) {
            // Cấu hình authentication cho request này
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            // 1. Set SecurityContext (cho các thư viện cần nó, dù trong WebFlux nó hơi chập chờn)
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 2. QUAN TRỌNG: Đẩy vào GraphQL Context để dùng trong Controller/Resolver
            request.configureExecutionInput((executionInput, builder) -> 
                builder.graphQLContext(context -> {
                    context.put("currentUser", userDetails);
                    context.put("authentication", authentication);
                }).build()
            );
        } else {
            // Log warning if user not found (might be keep-alive subscription)
            String operationName = request.getOperationName();
            if (operationName != null && !operationName.equals("KeepAlive")) {
                System.out.println("⚠️ WebSocket: No user found in request attributes for operation: " + operationName);
            }
        }

        return chain.next(request);
    }

    private String extractToken(Map<String, Object> payload) {
        String[] keys = {"authToken", "Authorization", "authorization", "token"};
        for (String key : keys) {
            if (payload.containsKey(key)) {
                String val = String.valueOf(payload.get(key));
                return val.startsWith("Bearer ") ? val.substring(7) : val;
            }
        }
        return null;
    }
}