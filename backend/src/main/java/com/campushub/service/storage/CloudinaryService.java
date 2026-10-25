package com.campushub.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService extends FileStorageService {
    String uploadResource(MultipartFile file, String folder);
    String uploadImage(MultipartFile file, String folder);
    String uploadPdf(MultipartFile file, String folder);
    String uploadResume(MultipartFile file);
    boolean deleteResource(String publicIdOrUrl);
    boolean deleteFile(String publicIdOrUrl);
    byte[] downloadFileBytes(String fileUrl);
    String extractPublicIdFromUrl(String url);
    String recoverAssetUrl(String publicId, String fileName);
}
