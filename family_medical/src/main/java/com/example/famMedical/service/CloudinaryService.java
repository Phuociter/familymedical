package com.example.famMedical.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload file lên Cloudinary
     * @param file File cần upload
     * @return URL của file trên Cloudinary
     * @throws IOException nếu upload thất bại
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // Tạo unique file name với UUID
        String fileName = UUID.randomUUID().toString();
        
        // Tổ chức file vào folder: family-medical/medical-records/
        // public_id sẽ là: family-medical/medical-records/{UUID}
        String publicId = "family-medical/medical-records/" + fileName;
        
        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "public_id", publicId,
            "resource_type", "auto" // Tự động detect image, video, raw, etc.
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), uploadParams);
        
        // Trả về secure URL của file
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Xóa file khỏi Cloudinary dựa trên URL
     * @param fileUrl URL của file trên Cloudinary
     * @return true nếu xóa thành công
     */
    public boolean deleteFile(String fileUrl) {
        try {
            // Extract public_id từ URL
            String publicId = extractPublicIdFromUrl(fileUrl);
            if (publicId == null) {
                return false;
            }

            // Xóa file từ Cloudinary
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return true;
        } catch (Exception e) {
            // Log lỗi nhưng không throw exception
            System.err.println("Error deleting file from Cloudinary: " + e.getMessage());
            return false;
        }
    }

    /**
     * Extract public_id từ Cloudinary URL
     * Ví dụ: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/file.jpg
     * -> folder/file
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }

        try {
            // Tìm phần sau /upload/
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) {
                return null;
            }

            String afterUpload = url.substring(uploadIndex + "/upload/".length());
            
            // Bỏ qua version và transformation params
            // Format: v1234567890/folder/file.jpg hoặc folder/file.jpg
            int slashIndex = afterUpload.indexOf("/");
            if (slashIndex == -1) {
                return null;
            }

            String path = afterUpload.substring(slashIndex + 1);
            
            // Bỏ extension
            int dotIndex = path.lastIndexOf(".");
            if (dotIndex != -1) {
                path = path.substring(0, dotIndex);
            }

            return path;
        } catch (Exception e) {
            return null;
        }
    }
}

