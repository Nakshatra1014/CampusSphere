package com.campushub.service.storage;

import com.campushub.exception.FileStorageException;
import com.campushub.exception.ResourceNotFoundException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryStorageService implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:wzvokqzr}")
    private String cloudName;

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    @Override
    public String uploadResource(MultipartFile file, String folder) {
        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "campushub/resources";
        return storeFileWithFolder(file, targetFolder);
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "campushub/images";
        return storeFileWithFolder(file, targetFolder);
    }

    @Override
    public String uploadPdf(MultipartFile file, String folder) {
        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "campushub/resources";
        return storeFileWithFolder(file, targetFolder);
    }

    @Override
    public String uploadResume(MultipartFile file) {
        return uploadResource(file, "campushub/resumes");
    }

    @Override
    public String storeFile(MultipartFile file, String folder) {
        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "campushub/general";
        return storeFileWithFolder(file, targetFolder);
    }

    private String storeFileWithFolder(MultipartFile file, String targetFolder) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Cannot store empty file.");
        }

        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toLowerCase();
        }

        // Determine Cloudinary resource_type: "image" for image assets, "raw" for PDF and academic documents
        String cloudResourceType = IMAGE_EXTENSIONS.contains(extension) ? "image" : "raw";

        // 1. If live Cloudinary credentials are configured, upload to Cloudinary
        if (cloudName != null && !cloudName.isBlank() && !"demo".equalsIgnoreCase(cloudName)) {
            try {
                Map<?, ?> uploadParams = ObjectUtils.asMap(
                        "folder", targetFolder,
                        "resource_type", cloudResourceType,
                        "use_filename", true,
                        "unique_filename", true
                );
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
                String secureUrl = (String) uploadResult.get("secure_url");
                if (secureUrl != null && !secureUrl.isBlank()) {
                    log.info("Uploaded file successfully to Cloudinary (type: {}): {}", cloudResourceType, secureUrl);
                    return secureUrl;
                }
            } catch (Exception ex) {
                log.warn("Cloudinary upload failed ({}), falling back to local file storage.", ex.getMessage());
            }
        }

        // 2. Fallback to local storage for zero-friction local execution
        try {
            String dotExtension = extension.isEmpty() ? "" : "." + extension;
            String uniqueFileName = UUID.randomUUID().toString() + dotExtension;

            // Sanitize folder for local path
            String localFolder = targetFolder.replace('/', '_').replace('\\', '_');
            Path uploadDirectory = Paths.get("./uploads/" + localFolder);
            if (!Files.exists(uploadDirectory)) {
                Files.createDirectories(uploadDirectory);
            }

            Path targetLocation = uploadDirectory.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + localFolder + "/" + uniqueFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file locally.", ex);
        }
    }

    @Override
    public boolean deleteResource(String publicIdOrUrl) {
        return deleteFile(publicIdOrUrl);
    }

    @Override
    public boolean deleteFile(String publicIdOrUrl) {
        if (publicIdOrUrl == null || publicIdOrUrl.isBlank()) return false;

        if (publicIdOrUrl.startsWith("/uploads/")) {
            try {
                Path path = Paths.get("." + publicIdOrUrl);
                return Files.deleteIfExists(path);
            } catch (IOException e) {
                log.error("Failed to delete local file: {}", publicIdOrUrl, e);
                return false;
            }
        } else if (publicIdOrUrl.contains("cloudinary.com")) {
            try {
                String publicId = extractPublicId(publicIdOrUrl);
                if (publicId != null) {
                    try {
                        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "raw"));
                    } catch (Exception e) {
                        // ignore
                    }
                    try {
                        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
                    } catch (Exception e) {
                        // ignore
                    }
                    try {
                        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    } catch (Exception e) {
                        // ignore
                    }
                }
                return true;
            } catch (Exception e) {
                log.warn("Failed to delete Cloudinary file: {}", e.getMessage());
                return false;
            }
        }
        return true;
    }

    @Override
    public byte[] downloadFileBytes(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new ResourceNotFoundException("File storage URL is missing.");
        }

        if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
            try {
                HttpClient client = HttpClient.newBuilder()
                        .followRedirects(HttpClient.Redirect.ALWAYS)
                        .connectTimeout(Duration.ofSeconds(15))
                        .build();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(fileUrl))
                        .GET()
                        .timeout(Duration.ofSeconds(30))
                        .build();

                HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    return response.body();
                } else {
                    log.error("Cloud storage returned status code {} for URL {}", response.statusCode(), fileUrl);
                    throw new FileStorageException("Failed to download file from storage provider. Status: " + response.statusCode());
                }
            } catch (Exception e) {
                log.error("Error downloading file bytes from {}: {}", fileUrl, e.getMessage());
                throw new FileStorageException("Failed to retrieve file from storage: " + e.getMessage(), e);
            }
        } else if (fileUrl.startsWith("/uploads/")) {
            try {
                Path path = Paths.get("." + fileUrl);
                if (!Files.exists(path)) {
                    throw new ResourceNotFoundException("Local file not found on server.");
                }
                return Files.readAllBytes(path);
            } catch (IOException e) {
                throw new FileStorageException("Failed to read local file.", e);
            }
        } else {
            throw new FileStorageException("Unsupported file URL format: " + fileUrl);
        }
    }

    @Override
    public String extractPublicIdFromUrl(String url) {
        return extractPublicId(url);
    }

    private String extractPublicId(String url) {
        if (url == null || url.isBlank()) return null;
        try {
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) return null;
            String afterUpload = url.substring(uploadIndex + 8);
            if (afterUpload.startsWith("v") && afterUpload.indexOf('/') != -1) {
                afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
            }
            int dotIndex = afterUpload.lastIndexOf('.');
            return dotIndex != -1 ? afterUpload.substring(0, dotIndex) : afterUpload;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String recoverAssetUrl(String publicId, String fileName) {
        if (cloudName == null || cloudName.isBlank() || "demo".equalsIgnoreCase(cloudName)) {
            // Local fallback check
            if (fileName != null && !fileName.isBlank()) {
                Path localDir = Paths.get("./uploads/campussphere_resources");
                if (Files.exists(localDir)) {
                    try (var stream = Files.list(localDir)) {
                        var found = stream.filter(p -> p.getFileName().toString().contains(fileName)).findFirst();
                        if (found.isPresent()) {
                            return "/uploads/campussphere_resources/" + found.get().getFileName().toString();
                        }
                    } catch (Exception ignored) {}
                }
            }
            return null;
        }

        // 1. If publicId is provided, query Cloudinary directly
        if (publicId != null && !publicId.isBlank()) {
            for (String rType : new String[]{"raw", "image"}) {
                try {
                    Map<?, ?> details = cloudinary.api().resource(publicId, ObjectUtils.asMap("resource_type", rType));
                    if (details != null && details.get("secure_url") != null) {
                        return (String) details.get("secure_url");
                    }
                } catch (Exception ignored) {
                }
            }
        }

        // 2. If publicId was not saved or not found, query Cloudinary by file name prefix
        if (fileName != null && !fileName.isBlank()) {
            String baseName = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
            for (String folder : new String[]{"campussphere/resources", "campushub/resources"}) {
                for (String rType : new String[]{"raw", "image"}) {
                    try {
                        Map<?, ?> result = cloudinary.api().resources(ObjectUtils.asMap(
                                "type", "upload",
                                "prefix", folder + "/" + baseName,
                                "resource_type", rType,
                                "max_results", 5
                        ));
                        if (result != null && result.containsKey("resources")) {
                            List<?> resourcesList = (List<?>) result.get("resources");
                            if (resourcesList != null && !resourcesList.isEmpty()) {
                                Map<?, ?> first = (Map<?, ?>) resourcesList.get(0);
                                if (first != null && first.get("secure_url") != null) {
                                    return (String) first.get("secure_url");
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        return null;
    }
}
