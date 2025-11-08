package com.example.famMedical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileDownload {
    private String fileName;
    private String fileUrl;
    private String contentType;
}