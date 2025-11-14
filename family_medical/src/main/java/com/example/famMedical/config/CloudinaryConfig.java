package com.example.famMedical.config;

import io.github.cdimascio.dotenv.Dotenv;
import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Dotenv dotenv = Dotenv.load();
        String cloudinaryUrl = dotenv.get("CLOUDINARY_URL");
        
        // Nếu không có CLOUDINARY_URL trong .env, thử đọc từ environment variable
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            cloudinaryUrl = System.getenv("CLOUDINARY_URL");
        }
        
        // Nếu vẫn không có, trả về instance với config rỗng (không crash app)
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return new Cloudinary(new java.util.HashMap<>());
        }
        
        return new Cloudinary(cloudinaryUrl);
    }
}

