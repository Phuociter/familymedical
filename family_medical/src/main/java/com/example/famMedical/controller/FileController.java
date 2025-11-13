package com.example.famMedical.controller;


import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.service.MedicalRecordService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private MedicalRecordService medicalRecordService; 

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPdf(@RequestParam("file") MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
        return ResponseEntity.ok((String) uploadResult.get("secure_url"));
    }

    @GetMapping("/pdfs/{memberId}")
    public ResponseEntity<List<String>> getMemberPDFs(@PathVariable Integer memberId) {
        // Giả sử bạn lưu danh sách PDF trong DB với link Cloudinary
        List< String> pdfs = medicalRecordService.getFileLinksByMemberId(memberId);
        // Mỗi Map có { "id": ..., "name": ..., "url": ... }
        return ResponseEntity.ok(pdfs);
    }
}

