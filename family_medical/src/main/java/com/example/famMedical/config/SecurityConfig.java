package com.example.famMedical.config;

import com.example.famMedical.security.JwtAuthenticationFilter; // IMPORT FILTER
import com.example.famMedical.service.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;


    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }



    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/graphql", "/graphiql", "/login/oauth2/**", "/oauth2/**").permitAll()
                .anyRequest().authenticated()
        );
        http.oauth2Login(oauth -> oauth.successHandler(oAuth2LoginSuccessHandler));
        http.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}