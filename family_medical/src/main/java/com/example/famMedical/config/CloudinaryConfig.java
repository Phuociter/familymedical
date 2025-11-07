package com.example.famMedical.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

import java.util.HashMap;
import java.util.Map;

@Configuration
@DependsOn("envConfig") // Đảm bảo EnvConfig chạy trước
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(
            @Value("${cloudinary.cloud_name:}") String cloudNameFromYml,
            @Value("${CLOUDINARY_CLOUD_NAME:}") String cloudNameFromEnv) {
        
        // Ưu tiên đọc từ System properties (đã được load từ .env), sau đó từ environment variables, cuối cùng từ yml
        String cloudName = System.getProperty("CLOUDINARY_CLOUD_NAME");
        if (cloudName == null || cloudName.isEmpty()) {
            cloudName = System.getenv("CLOUDINARY_CLOUD_NAME");
        }
        if (cloudName == null || cloudName.isEmpty()) {
            cloudName = cloudNameFromEnv;
        }
        if (cloudName == null || cloudName.isEmpty()) {
            cloudName = cloudNameFromYml;
        }

        String apiKey = System.getProperty("CLOUDINARY_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getenv("CLOUDINARY_API_KEY");
        }
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getProperty("cloudinary.api_key");
        }

        String apiSecret = System.getProperty("CLOUDINARY_API_SECRET");
        if (apiSecret == null || apiSecret.isEmpty()) {
            apiSecret = System.getenv("CLOUDINARY_API_SECRET");
        }
        if (apiSecret == null || apiSecret.isEmpty()) {
            apiSecret = System.getProperty("cloudinary.api_secret");
        }

        // Chỉ khởi tạo Cloudinary nếu có đầy đủ credentials
        if (cloudName == null || cloudName.isEmpty() || 
            apiKey == null || apiKey.isEmpty() || 
            apiSecret == null || apiSecret.isEmpty()) {
            throw new IllegalStateException(
                "Cloudinary credentials chưa được cấu hình.\n" +
                "Vui lòng:\n" +
                "1. Tạo file .env ở thư mục gốc với:\n" +
                "   CLOUDINARY_CLOUD_NAME=your_cloud_name\n" +
                "   CLOUDINARY_API_KEY=your_api_key\n" +
                "   CLOUDINARY_API_SECRET=your_api_secret\n" +
                "HOẶC\n" +
                "2. Set environment variables trong hệ điều hành\n" +
                "HOẶC\n" +
                "3. Cấu hình trong application.yml"
            );
        }
        
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}

