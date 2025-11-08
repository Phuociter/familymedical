package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtService jwtService;

    // We will add this property to application.yml later
    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        // Step 1: Process the OAuth2 user to get or create a local user.
        // We will implement this method in the AuthService next.
        User user = authService.processOAuth2User(provider, oauth2User);

        // Step 2: Generate a JWT token for the user.
        String token = jwtService.generateToken(user);

        // Step 3: Determine redirect URL based on profile completion status
        String targetUrl;
        if (!user.isProfileComplete()) {
            // Redirect to a page where the user can complete their profile (e.g., family details)
            targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/complete-profile")
                    .queryParam("token", token)
                    .queryParam("userId", user.getUserID())
                    .queryParam("email", user.getEmail())
                    .queryParam("role", user.getRole().name())
                    .build().encode().toUriString();
        } else {
            // Redirect to the main callback page which then redirects to dashboard
            targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                    .queryParam("token", token)
                    .queryParam("userId", user.getUserID())
                    .queryParam("fullName", user.getFullName())
                    .queryParam("email", user.getEmail())
                    .queryParam("role", user.getRole().name())
                    .build().encode().toUriString();
        }

        // Step 4: Redirect the user.
        response.sendRedirect(targetUrl);
    }
}
