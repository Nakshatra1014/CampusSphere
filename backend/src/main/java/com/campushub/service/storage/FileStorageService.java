package com.campushub.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String folder);
    boolean deleteFile(String publicIdOrUrl);
}
