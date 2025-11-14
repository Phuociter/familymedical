// src/main/java/com/example/famMedical/config/CorsConfig.java

package com.example.famMedical.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Cho phép các request từ địa chỉ Frontend của bạn
                registry.addMapping("/**") // Áp dụng cho tất cả các đường dẫn (endpoints)
                        .allowedOrigins("http://localhost:3000") // Địa chỉ Frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // Cho phép các phương thức này
                        .allowedHeaders("*") // Cho phép tất cả các header (bao gồm Authorization, Content-Type)
                        .exposedHeaders("*") // Expose các header trong response
                        .allowCredentials(true) // Cho phép truyền cookie/credentials
                        .maxAge(3600); // Cache preflight requests trong 1 giờ
            }
        };
    }
}