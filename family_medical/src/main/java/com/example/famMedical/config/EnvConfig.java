package com.example.famMedical.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

/**
 * Class để load .env file tự động khi ứng dụng khởi động
 * Spring Boot không tự động load .env file, cần load thủ công
 */
@Component
public class EnvConfig {

    @PostConstruct
    public void loadEnv() {
        try {
            // Tìm .env file ở các vị trí có thể
            File[] possibleLocations = {
                new File(".env"), // Thư mục gốc
                new File("family_medical/.env"), // Trong thư mục family_medical
                new File("../.env") // Parent directory
            };

            File envFile = null;
            for (File location : possibleLocations) {
                if (location.exists() && location.isFile()) {
                    envFile = location;
                    break;
                }
            }

            if (envFile == null) {
                System.out.println("Không tìm thấy file .env. Sử dụng environment variables hoặc application.yml");
                return;
            }

            // Đọc và parse .env file
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    
                    // Bỏ qua comments và empty lines
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }

                    // Parse KEY=VALUE format
                    int equalIndex = line.indexOf('=');
                    if (equalIndex > 0) {
                        String key = line.substring(0, equalIndex).trim();
                        String value = line.substring(equalIndex + 1).trim();
                        
                        // Remove quotes nếu có
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }

                        // Chỉ set nếu chưa có trong system environment
                        if (System.getenv(key) == null && System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
                System.out.println("Đã load file .env từ: " + envFile.getAbsolutePath());
            }
        } catch (IOException e) {
            // Log nhưng không fail application nếu không có .env file
            System.out.println("Không thể đọc file .env: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Lỗi khi load .env file: " + e.getMessage());
        }
    }
}

