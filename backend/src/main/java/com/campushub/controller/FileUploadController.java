package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.service.storage.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/file")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder
    ) {
        String fileUrl = cloudinaryService.storeFile(file, folder);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("url", fileUrl);
        responseData.put("fileName", file.getOriginalFilename());
        responseData.put("fileSize", file.getSize());
        responseData.put("contentType", file.getContentType());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(responseData, "File uploaded successfully to storage."));
    }

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "images") String folder
    ) {
        String fileUrl = cloudinaryService.uploadImage(file, folder);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("url", fileUrl);
        responseData.put("fileName", file.getOriginalFilename());
        responseData.put("fileSize", file.getSize());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(responseData, "Image uploaded successfully."));
    }

    @PostMapping("/pdf")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "resources") String folder
    ) {
        String fileUrl = cloudinaryService.uploadPdf(file, folder);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("url", fileUrl);
        responseData.put("fileName", file.getOriginalFilename());
        responseData.put("fileSize", file.getSize());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(responseData, "PDF uploaded successfully."));
    }
}
