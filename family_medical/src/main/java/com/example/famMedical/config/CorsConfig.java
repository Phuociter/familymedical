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
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các phương thức này
                        .allowedHeaders("*") // Cho phép tất cả các header (bao gồm Authorization)
                        .allowCredentials(true); // Cho phép truyền cookie/credentials (cần cho một số cấu hình security)
            }
        };
    }
}